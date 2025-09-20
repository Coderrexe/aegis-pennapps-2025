#ifndef MULTI_OBJECTIVE_ASTAR_HPP
#define MULTI_OBJECTIVE_ASTAR_HPP

#include <vector>
#include <string>

struct Path {
    std::string name;
    int idx;
    std::vector<int> path;
    double time;
    double dark;
};

std::vector<Path> solve(int N, int M, const std::vector<double>& light, const std::vector<int>& crime,
                      const std::vector<std::vector<int>>& input, int s, int t);

#endif
