import redis.asyncio as redis
from datetime import datetime, timedelta, timezone
import os

class RateLimiter:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        # Default to False (Dev Mode) for safety and ease of use
        self.enabled = os.getenv("ENABLE_LIMITS", "false").lower() == "true"
        self.redis_url = redis_url
        self.redis = None
        
        # Configuration
        self.GLOBAL_LIMIT = int(os.getenv("LIMIT_GLOBAL", "1000"))
        self.IP_LIMIT_HOURS = int(os.getenv("LIMIT_HOURS", "24"))
        
        if self.enabled:
            try:
                self.redis = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
                print(f"[RateLimiter] 🛡️ Limits ENABLED. Connected to Redis.")
            except Exception as e:
                print(f"[RateLimiter] ⚠️ Failed to connect to Redis: {e}. Falling back to unlimited mode.")
                self.enabled = False
        else:
            print("[RateLimiter] 🚀 Limits DISABLED (Dev/Local Mode). Set ENABLE_LIMITS=true to enable.")

    async def get_global_usage(self) -> dict:
        """Returns current global usage stats."""
        if not self.enabled:
            return {
                "total_limit": self.GLOBAL_LIMIT,
                "used": 0,
                "remaining": self.GLOBAL_LIMIT,
                "is_exhausted": False
            }

        try:
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            global_key = f"global:demos:{today}"
            used = int(await self.redis.get(global_key) or 0)
            
            return {
                "total_limit": self.GLOBAL_LIMIT,
                "used": used,
                "remaining": max(0, self.GLOBAL_LIMIT - used),
                "is_exhausted": used >= self.GLOBAL_LIMIT
            }
        except Exception as e:
            print(f"[RateLimiter] Error getting stats: {e}")
            return {"is_exhausted": False} # Fail open

    async def check_ip_availability(self, ip_address: str) -> dict:
        """Checks if a specific IP can use a demo."""
        if not self.enabled:
             return {"can_try": True, "wait_seconds": 0}

        try:
            key = f"ip:{ip_address}:last_demo"
            last_usage_ts = await self.redis.get(key)

            if not last_usage_ts:
                return {"can_try": True, "wait_seconds": 0}

            last_usage = datetime.fromtimestamp(float(last_usage_ts), tz=timezone.utc)
            now = datetime.now(timezone.utc)
            elapsed = now - last_usage
            cooldown = timedelta(hours=self.IP_LIMIT_HOURS)
            
            if elapsed < cooldown:
                remaining_wait = cooldown - elapsed
                return {
                    "can_try": False, 
                    "wait_seconds": int(remaining_wait.total_seconds())
                }
            
            return {"can_try": True, "wait_seconds": 0}
        except Exception:
            return {"can_try": True, "wait_seconds": 0} # Fail open

    async def verify_request_allowed(self, ip_address: str) -> dict:
        """Composite check: Global AND IP."""
        if not self.enabled:
            return {"allowed": True}

        global_stats = await self.get_global_usage()
        if global_stats["is_exhausted"]:
            return {"allowed": False, "reason": "global_limit", "details": global_stats}

        ip_stats = await self.check_ip_availability(ip_address)
        if not ip_stats["can_try"]:
            return {"allowed": False, "reason": "ip_limit", "details": ip_stats}
            
        return {"allowed": True}

    async def record_usage(self, ip_address: str):
        """Records a successful demo usage."""
        if not self.enabled:
            return

        try:
            now = datetime.now(timezone.utc)
            today = now.strftime("%Y-%m-%d")
            
            # Increment Global
            global_key = f"global:demos:{today}"
            await self.redis.incr(global_key)
            
            # Set IP timestamp
            ip_key = f"ip:{ip_address}:last_demo"
            await self.redis.set(ip_key, now.timestamp())
        except Exception as e:
            print(f"[RateLimiter] Error recording usage: {e}")

# Singleton instance
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
limiter = RateLimiter(redis_url)
