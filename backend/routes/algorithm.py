import logging
from flask import Blueprint, jsonify, request
from algorithm.astar_solver import run_astar_solver

algorithm_bp = Blueprint('algorithm_bp', __name__)
logger = logging.getLogger(__name__)

@algorithm_bp.route('/api/algorithm/run-astar', methods=['POST'])
def run_astar_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid JSON payload'}), 400
    required_params = ['N', 'M', 'light', 'crime', 'input', 's', 't']
    missing_params = [p for p in required_params if p not in data]
    if missing_params:
        return jsonify({'error': f'Missing required parameters: {", ".join(missing_params)}'}), 400

    try:
        results = run_astar_solver(
            data['N'],
            data['M'],
            data['light'],
            data['crime'],
            data['input'],
            data['s'],
            data['t']
        )

        return jsonify({
            'status': 'success',
            'results': results
        })

    except (TypeError, ValueError) as e:
        logger.error(f"Data type error calling Cython module: {e}")
        return jsonify({'error': 'Invalid data types in request payload', 'details': str(e)}), 400
    except Exception as e:
        logger.error(f"An unexpected error occurred in the A* solver: {e}")
        return jsonify({'error': 'An internal error occurred in the solver', 'details': str(e)}), 500