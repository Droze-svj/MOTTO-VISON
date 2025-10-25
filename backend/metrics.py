from prometheus_client import Counter, Histogram

# Counter for onboarding step completions
onboarding_step_counter = Counter(
    "onboarding_step_completed",
    "Number of times each onboarding step is completed",
    ["step"]
)

# Counter for feature usage
feature_usage_counter = Counter(
    "feature_usage",
    "Feature usage count",
    ["feature"]
)

# Optional: API latency histogram
api_latency = Histogram(
    "api_latency_seconds",
    "API endpoint latency in seconds",
    ["endpoint"]
)

# Example usage in FastAPI endpoints:
# from .metrics import onboarding_step_counter, feature_usage_counter
# onboarding_step_counter.labels(step="theme_selection").inc()
# feature_usage_counter.labels(feature="voice_command").inc() 