#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <limits>
#include <algorithm>
#include <iomanip>
#include <set>

using namespace std;

struct Edge {
    int to;
    double time_cost;
};

struct Label {
    double time = 0.0;
    double dark = 0.0;
    int node = -1;
    int prev_node = -1;
    int prev_label_idx = -1;
};

struct PQItem {
    double f_time;
    double f_dark;
    int node;
    int label_idx; 
    bool operator<(const PQItem& o) const {
        if (f_time != o.f_time) return f_time > o.f_time; 
        return f_dark > o.f_dark;
    }
};

struct Path { 
    string name; 
    int idx; 
    vector<int> path; 
    double time, dark; 
};


static inline bool dominates(const Label& a, const Label& b) {
    const double EPS = 1e-12;
    return (a.time <= b.time + EPS) && (a.dark <= b.dark + EPS) &&
           ((a.time + EPS < b.time) || (a.dark + EPS < b.dark));
}

vector<int> reconstruct_path(int t, int label_idx, const vector<vector<Label>>& labels) {
    vector<int> path;
    int node = t, idx = label_idx;
    while (node != -1 && idx != -1) {
        path.push_back(node);
        const Label& L = labels[node][idx];
        node = L.prev_node;
        idx = L.prev_label_idx;
    }
    reverse(path.begin(), path.end());
    return path;
}

// Single-criterion reverse Dijkstra from target t to produce admissible, consistent lower bounds.
// We traverse the undirected graph "in reverse" by using the same edges.
template <class WeightFn>
vector<double> reverse_dijkstra_lb(const vector<vector<Edge>>& g, int t, WeightFn weight) {
    const double INF = numeric_limits<double>::infinity();
    int n = (int)g.size();
    vector<double> dist(n, INF);
    using P = pair<double,int>;
    priority_queue<P, vector<P>, greater<P>> pq;
    dist[t] = 0.0;
    pq.push({0.0, t});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u] + 1e-12) continue;
        for (const auto& e : g[u]) {
            int v = e.to;
            double w = weight(u, v, e);
            if (dist[v] > dist[u] + w + 1e-12) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}

vector<Path> solve(int N, int M, const vector<double>& light, const vector<int>& crime,
           const vector<vector<int>>& input, int s, int t) {
    set<int> bad_nodes;
    for(int i = 0; i < N; i++) {
        if(crime[i] == 1) bad_nodes.insert(i);
    }
    vector<vector<Edge>> g(N);
    g.reserve(N);
    for (const auto& e : input) {
        int u = e[0], v = e[1];
        double tcost = e[2];
        if(bad_nodes.find(u) != bad_nodes.end() || bad_nodes.find(v) != bad_nodes.end()) continue;
        g[u].push_back({v, tcost});
        g[v].push_back({u, tcost});
    }
    auto is_forbidden = [&](int node) {
        if (node == s || node == t) return false;
        return crime[node] == 1;
    };

    // TODO: consider changing darkness definition
    double Lmax = 0.0;
    for (double L : light) Lmax = max(Lmax, L);
    if (Lmax <= 0.0) Lmax = 1.0;

    auto lb_time = reverse_dijkstra_lb(g, t,
        [&](int u, int v, const Edge& e) {
            (void)u; (void)v;
            return e.time_cost;
        });

    auto lb_dark = reverse_dijkstra_lb(g, t,
        [&](int u, int v, const Edge& e) {
            double avg_light = 0.5 * (light[u] + light[v]);
            double edge_dark = max(0.0, Lmax - avg_light);
            return edge_dark;
        });
    for (int i = 0; i < N; ++i) {
        if (!isfinite(lb_time[i])) lb_time[i] = 0.0;
        if (!isfinite(lb_dark[i])) lb_dark[i] = 0.0;
    }

    vector<vector<Label>> labels(N);
    priority_queue<PQItem> open;
    labels[s].push_back(Label{0.0, max(0.0, Lmax - light[s]), s, -1, -1});
    int seed_idx = (int)labels[s].size() - 1;
    open.push(PQItem{
        labels[s][seed_idx].time + lb_time[s],
        labels[s][seed_idx].dark + lb_dark[s],
        s, seed_idx
    });

    /* Termination check (not used)

    auto can_terminate = [&](const PQItem& top, const vector<Label>& goals) -> bool {
        if (goals.empty()) return false;
        // If best OPEN f >= every goal's g (lexicographically), no unseen label can beat goal set.
        for (const auto& gl : goals) {
            if (top.f_time + 1e-12 < gl.time || (fabs(top.f_time - gl.time) <= 1e-12 && top.f_dark + 1e-12 < gl.dark)) {
                // top.f strictly better than at least one goal.g lexicographically → cannot stop
                return false;
            }
        }
        return true;
    };
    
    */

    // NAMOA*
    while (!open.empty()) {
        auto cur = open.top(); open.pop();

        if (cur.label_idx >= (int)labels[cur.node].size()) continue;
        const Label& Lcur = labels[cur.node][cur.label_idx];
        int u = cur.node;
        for (const auto& e : g[u]) {
            int v = e.to;
            if (is_forbidden(v)) continue;

            double avg_light = 0.5 * (light[u] + light[v]);
            double edge_dark = max(0.0, Lmax - avg_light);

            Label cand;
            cand.time = Lcur.time + e.time_cost;
            cand.dark = Lcur.dark + edge_dark;
            cand.node = v;
            cand.prev_node = u;
            cand.prev_label_idx = cur.label_idx;

            // Check if bad
            bool dominated_by_existing = false;
            for (const auto& ex : labels[v]) {
                if (dominates(ex, cand)) { dominated_by_existing = true; break; }
            }
            if (dominated_by_existing) continue;

            labels[v].push_back(cand);
            int new_idx = (int)labels[v].size() - 1;

            // Pruning
            vector<Label> kept;
            kept.reserve(labels[v].size());
            for (int i = 0; i < (int)labels[v].size(); ++i) {
                if (i == new_idx) { kept.push_back(labels[v][i]); continue; }
                if (dominates(cand, labels[v][i])) continue;
                kept.push_back(labels[v][i]);
            }
            labels[v].swap(kept);

            // Find index of cand after pruning swap
            int cand_idx = labels[v].size() - 1;
            /*
            int cand_idx = -1;
            for (int i = 0; i < (int)labels[v].size(); ++i) {
                const Label& L = labels[v][i];
                if (L.prev_node == u && L.prev_label_idx == cur.label_idx &&
                    fabs(L.time - cand.time) <= 1e-12 && fabs(L.dark - cand.dark) <= 1e-12) {
                    cand_idx = i; break;
                }
            }
            if (cand_idx == -1) continue;
            */

            // Push with f = g + h
            double fT = labels[v][cand_idx].time + lb_time[v];
            double fD = labels[v][cand_idx].dark + lb_dark[v];
            open.push(PQItem{fT, fD, v, cand_idx});
        }
        // if (!open.empty() && can_terminate(open.top(), labels[t])) {
        //     break;
        // }
    }

    if (labels[t].empty()) {
        cout << "No feasible path (crime constraints may disconnect the graph).\n";
        return {};
    }

    vector<Path> picks;

    int idx_fast = 0;
    for (int i = 1; i < (int)labels[t].size(); ++i)
        if (labels[t][i].time < labels[t][idx_fast].time) idx_fast = i;
    picks.push_back({"fastest", idx_fast, reconstruct_path(t, idx_fast, labels),
                     labels[t][idx_fast].time, labels[t][idx_fast].dark});

    int idx_bright = 0;
    for (int i = 1; i < (int)labels[t].size(); ++i)
        if (labels[t][i].dark < labels[t][idx_bright].dark) idx_bright = i;
    picks.push_back({"best_lit", idx_bright, reconstruct_path(t, idx_bright, labels),
                     labels[t][idx_bright].time, labels[t][idx_bright].dark});

    double tmin = numeric_limits<double>::infinity(), tmax = -numeric_limits<double>::infinity();
    double dmin = numeric_limits<double>::infinity(), dmax = -numeric_limits<double>::infinity();
    for (const auto& L : labels[t]) {
        tmin = min(tmin, L.time); tmax = max(tmax, L.time);
        dmin = min(dmin, L.dark); dmax = max(dmax, L.dark);
    }
    auto norm = [](double x, double a, double b) {
        if (!isfinite(a) || !isfinite(b) || b - a < 1e-12) return 0.0;
        return (x - a) / (b - a);
    };
    int idx_bal = 0; double best_score = numeric_limits<double>::infinity();
    for (int i = 0; i < (int)labels[t].size(); ++i) {
        double nt = norm(labels[t][i].time, tmin, tmax);
        double nd = norm(labels[t][i].dark, dmin, dmax);
        double score = hypot(nt, nd);
        if (score < best_score) { best_score = score; idx_bal = i; }
    }
    picks.push_back({"balanced", idx_bal, reconstruct_path(t, idx_bal, labels),
                     labels[t][idx_bal].time, labels[t][idx_bal].dark});
    
    /* Standard Output 

    auto print_pick = [&](const Path& p) {
        cout << "=== " << p.name << " ===\n";
        cout << fixed << setprecision(3)
             << "time=" << p.time << "  darkness=" << p.dark << "\n";
        cout << "path_len=" << p.path.size() << "\n";
        for (size_t i = 0; i < p.path.size(); ++i) {
            if (i) cout << ' ';
            cout << p.path[i];
        }
        cout << "\n";
    };

    for (string name : {"fastest", "best_lit", "balanced"}) {
        for (const auto& p : picks) if (p.name == name) { print_pick(p); break; }
    }
    
    */

    return picks;
 }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Random Test Case

    int N = 6, M = 6;

    vector<double> light = {1, 1, 1, 0.5, 1, 0.2};
    vector<int> crime = {0, 1, 0, 0, 0, 0};

    vector<vector<int>> input = {
        {0, 3, 3},
        {2, 3, 5},
        {2, 5, 2},
        {3, 5, 1},
        {5, 4, 1},
        {2, 4, 1}
    };
    int s = 0, t = 4;
    solve(N, M, light, crime, input, s, t);
    return 0;
}