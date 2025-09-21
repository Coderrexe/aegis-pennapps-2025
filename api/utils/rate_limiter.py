"""
Rate Limiter for Crime Data API

Simple in-memory rate limiter to prevent API abuse
"""

import time
import os
from collections import defaultdict, deque
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self):
        self.rate_limit = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))
        self.window_size = 60  # 1 minute window
        
        # Store request timestamps for each client
        self.client_requests: Dict[str, deque] = defaultdict(lambda: deque())
        
        # Cleanup old entries periodically
        self.last_cleanup = time.time()
        self.cleanup_interval = 300  # 5 minutes
    
    def is_allowed(self, client_id: str) -> bool:
        """
        Check if client is allowed to make a request
        
        Args:
            client_id: Unique identifier for the client (usually IP address)
            
        Returns:
            True if request is allowed, False if rate limited
        """
        current_time = time.time()
        
        # Periodic cleanup
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_entries(current_time)
            self.last_cleanup = current_time
        
        # Get client's request history
        client_history = self.client_requests[client_id]
        
        # Remove requests outside the current window
        cutoff_time = current_time - self.window_size
        while client_history and client_history[0] < cutoff_time:
            client_history.popleft()
        
        # Check if under rate limit
        if len(client_history) < self.rate_limit:
            client_history.append(current_time)
            return True
        else:
            logger.warning(f"Rate limit exceeded for client {client_id}")
            return False
    
    def get_remaining_requests(self, client_id: str) -> int:
        """
        Get number of remaining requests for a client
        """
        current_time = time.time()
        client_history = self.client_requests[client_id]
        
        # Remove requests outside the current window
        cutoff_time = current_time - self.window_size
        while client_history and client_history[0] < cutoff_time:
            client_history.popleft()
        
        return max(0, self.rate_limit - len(client_history))
    
    def get_reset_time(self, client_id: str) -> float:
        """
        Get time when rate limit resets for a client
        """
        client_history = self.client_requests[client_id]
        
        if not client_history:
            return time.time()
        
        # Rate limit resets when the oldest request expires
        return client_history[0] + self.window_size
    
    def _cleanup_old_entries(self, current_time: float):
        """
        Remove old entries to prevent memory leaks
        """
        cutoff_time = current_time - self.window_size
        clients_to_remove = []
        
        for client_id, history in self.client_requests.items():
            # Remove old requests
            while history and history[0] < cutoff_time:
                history.popleft()
            
            # Mark empty histories for removal
            if not history:
                clients_to_remove.append(client_id)
        
        # Remove empty client histories
        for client_id in clients_to_remove:
            del self.client_requests[client_id]
        
        if clients_to_remove:
            logger.info(f"Cleaned up {len(clients_to_remove)} inactive client rate limit entries")
    
    def get_stats(self) -> dict:
        """
        Get rate limiter statistics
        """
        current_time = time.time()
        active_clients = 0
        total_requests = 0
        
        for client_id, history in self.client_requests.items():
            if history:
                active_clients += 1
                total_requests += len(history)
        
        return {
            'rate_limit_per_minute': self.rate_limit,
            'window_size_seconds': self.window_size,
            'active_clients': active_clients,
            'total_recent_requests': total_requests,
            'cleanup_interval_seconds': self.cleanup_interval
        }
    
    def reset_client(self, client_id: str):
        """
        Reset rate limit for a specific client
        """
        if client_id in self.client_requests:
            del self.client_requests[client_id]
            logger.info(f"Reset rate limit for client {client_id}")
    
    def block_client(self, client_id: str, duration_seconds: int = 3600):
        """
        Temporarily block a client by filling their rate limit
        """
        current_time = time.time()
        client_history = self.client_requests[client_id]
        
        # Clear existing history
        client_history.clear()
        
        # Fill with fake requests to block them
        for i in range(self.rate_limit):
            # Spread the fake requests across the window to ensure blocking
            fake_time = current_time - (self.window_size * i / self.rate_limit)
            client_history.append(fake_time)
        
        logger.warning(f"Blocked client {client_id} for rate limit violation")
