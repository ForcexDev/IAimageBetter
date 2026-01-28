class RateLimiterDev:
    def __init__(self):
        self.GLOBAL_LIMIT = 999999
        self.IP_LIMIT_HOURS = 0

    async def get_global_usage(self) -> dict:
        return {
            "total_limit": self.GLOBAL_LIMIT,
            "used": 0,
            "remaining": self.GLOBAL_LIMIT,
            "is_exhausted": False
        }

    async def check_ip_availability(self, ip_address: str) -> dict:
        return {"can_try": True, "wait_seconds": 0}

    async def verify_request_allowed(self, ip_address: str) -> dict:
        return {"allowed": True}

    async def record_usage(self, ip_address: str):
        pass

# Singleton instance
limiter = RateLimiterDev()
