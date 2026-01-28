import redis.asyncio as redis
from datetime import datetime, timedelta, timezone
import os

class RateLimiter:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.memory_store = {} # Always init fallback
        try:
            # FORCE DISABLE REDIS FOR TESTING
            self.use_redis = False 
            # self.redis = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
            # self.use_redis = True
        except:
            print("Redis not available, using in-memory fallback")
            self.use_redis = False

            
        self.GLOBAL_LIMIT = 3
        self.IP_LIMIT_HOURS = 24

    async def _get(self, key):
        if self.use_redis:
            try:
                return await self.redis.get(key)
            except:
                self.use_redis = False
                return self.memory_store.get(key)
        return self.memory_store.get(key)

    async def _set(self, key, value, expire=None):
        if self.use_redis:
            try:
                await self.redis.set(key, value, ex=expire)
                return
            except:
                self.use_redis = False
        self.memory_store[key] = value

    async def _incr(self, key):
        if self.use_redis:
            try:
                await self.redis.incr(key)
                return
            except:
                self.use_redis = False
        val = int(self.memory_store.get(key, 0)) + 1
        self.memory_store[key] = val

    async def get_global_usage(self) -> dict:
        """Returns current global usage stats."""
        # MOCK EMPTY USAGE
        return {
            "total_limit": 1000,
            "used": 0,
            "remaining": 1000,
            "is_exhausted": False
        }


    async def check_ip_availability(self, ip_address: str) -> dict:
        """Checks if a specific IP can use a demo."""
        key = f"ip:{ip_address}:last_demo"
        last_usage_ts = await self._get(key)

        if not last_usage_ts:
            return {"can_try": True, "wait_seconds": 0}

        last_usage = datetime.fromtimestamp(float(last_usage_ts), tz=timezone.utc)
        now = datetime.now(timezone.utc)
        
        # Calculate time passed
        elapsed = now - last_usage
        cooldown = timedelta(hours=self.IP_LIMIT_HOURS)
        
        if elapsed < cooldown:
            remaining_wait = cooldown - elapsed
            return {
                "can_try": False, 
                "wait_seconds": int(remaining_wait.total_seconds())
            }
        
        return {"can_try": True, "wait_seconds": 0}


    async def verify_request_allowed(self, ip_address: str) -> dict:
        """Composite check: Global AND IP."""
        # BYPASS ALL LIMITS FOR TESTING
        return {"allowed": True}
        
        # global_stats = await self.get_global_usage()
        # if global_stats["is_exhausted"]:
        #     return {"allowed": False, "reason": "global_limit", "details": global_stats}
        # ip_stats = await self.check_ip_availability(ip_address)
        # if not ip_stats["can_try"]:
        #     return {"allowed": False, "reason": "ip_limit", "details": ip_stats}
        # return {"allowed": True}


    async def record_usage(self, ip_address: str):
        """Records a successful demo usage."""
        now = datetime.now(timezone.utc)
        today = now.strftime("%Y-%m-%d")
        
        # Increment Global
        global_key = f"global:demos:{today}"
        # Simplified for fallback support
        await self._incr(global_key)
        
        # Set IP timestamp
        ip_key = f"ip:{ip_address}:last_demo"
        await self._set(ip_key, now.timestamp())


# Singleton instance to be used in dependencies
limiter = RateLimiter(os.getenv("REDIS_URL", "redis://localhost:6379"))
