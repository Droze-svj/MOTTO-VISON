import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
import os
from collections import defaultdict
import threading
import time
from dataclasses import dataclass, asdict
import statistics

logger = logging.getLogger(__name__)

@dataclass
class TranslationMetrics:
    timestamp: str = datetime.now().isoformat()
    text_length: int = 0
    translation_time: float = 0.0
    success: bool = True
    quality_score: float = 1.0
    source_language: str = 'en'
    target_language: str = 'en'
    error_message: Optional[str] = None
    total_translations: int = 0
    total_time: float = 0.0
    successful_translations: int = 0
    error_count: int = 0
    avg_translation_time: float = 0.0
    success_rate: float = 1.0
    language_pairs: Dict[str, Dict[str, Any]] = None
    error_by_language_pair: Dict[str, int] = None

    def __post_init__(self):
        if self.language_pairs is None:
            self.language_pairs = {}
        if self.error_by_language_pair is None:
            self.error_by_language_pair = {}

class TranslationMonitor:
    def __init__(self, log_file: str = "translation_metrics.json"):
        self.log_file = log_file
        self.metrics: List[TranslationMetrics] = []
        self.lock = threading.Lock()
        self.load_metrics()
        
        # Initialize counters
        self.daily_stats = defaultdict(lambda: {
            'total_translations': 0,
            'successful_translations': 0,
            'failed_translations': 0,
            'total_characters': 0,
            'total_time': 0.0,
            'quality_scores': []
        })
        
        # Start background cleanup thread
        self.cleanup_thread = threading.Thread(target=self._cleanup_old_metrics, daemon=True)
        self.cleanup_thread.start()

    def load_metrics(self) -> None:
        """Load metrics from file."""
        try:
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r') as f:
                    data = json.load(f)
                    self.metrics = [TranslationMetrics(**m) for m in data]
        except Exception as e:
            logger.error(f"Failed to load metrics: {str(e)}")
            self.metrics = []

    def save_metrics(self) -> None:
        """Save metrics to file."""
        try:
            with open(self.log_file, 'w') as f:
                json.dump([asdict(m) for m in self.metrics], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save metrics: {str(e)}")

    def record_translation(self, metrics: TranslationMetrics) -> None:
        """Record translation metrics."""
        with self.lock:
            self.metrics.append(metrics)
            self._update_daily_stats(metrics)
            self.save_metrics()

    def _update_daily_stats(self, metrics: TranslationMetrics) -> None:
        """Update daily statistics."""
        date = datetime.fromisoformat(metrics.timestamp).date().isoformat()
        stats = self.daily_stats[date]
        
        stats['total_translations'] += 1
        if metrics.success:
            stats['successful_translations'] += 1
        else:
            stats['failed_translations'] += 1
        
        stats['total_characters'] += metrics.text_length
        stats['total_time'] += metrics.translation_time
        stats['quality_scores'].append(metrics.quality_score)

    def _cleanup_old_metrics(self) -> None:
        """Clean up metrics older than 30 days."""
        while True:
            try:
                cutoff_date = datetime.now() - timedelta(days=30)
                with self.lock:
                    self.metrics = [
                        m for m in self.metrics 
                        if datetime.fromisoformat(m.timestamp) > cutoff_date
                    ]
                    self.save_metrics()
            except Exception as e:
                logger.error(f"Failed to cleanup metrics: {str(e)}")
            time.sleep(3600)  # Run cleanup every hour

    def get_performance_metrics(self, days: int = 7) -> Dict[str, Any]:
        """Get performance metrics for the last N days."""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_metrics = [
            m for m in self.metrics 
            if datetime.fromisoformat(m.timestamp) > cutoff_date
        ]
        
        if not recent_metrics:
            return {
                "average_translation_time": 0,
                "success_rate": 0,
                "average_quality_score": 0,
                "total_translations": 0
            }
        
        return {
            "average_translation_time": statistics.mean(m.translation_time for m in recent_metrics),
            "success_rate": sum(1 for m in recent_metrics if m.success) / len(recent_metrics),
            "average_quality_score": statistics.mean(m.quality_score for m in recent_metrics),
            "total_translations": len(recent_metrics)
        }

    def get_language_statistics(self) -> Dict[str, Dict[str, int]]:
        """Get statistics by language pair."""
        stats = defaultdict(lambda: defaultdict(int))
        
        for metric in self.metrics:
            if metric.success:
                stats[metric.source_language][metric.target_language] += 1
        
        return {k: dict(v) for k, v in stats.items()}

    def get_error_statistics(self) -> Dict[str, int]:
        """Get statistics of error types."""
        error_stats = defaultdict(int)
        
        for metric in self.metrics:
            if not metric.success and metric.error_message:
                error_stats[metric.error_message] += 1
        
        return dict(error_stats)

    def get_quality_trends(self, days: int = 7) -> Dict[str, List[float]]:
        """Get quality score trends over time."""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_metrics = [
            m for m in self.metrics 
            if datetime.fromisoformat(m.timestamp) > cutoff_date
        ]
        
        # Group by date
        daily_quality = defaultdict(list)
        for metric in recent_metrics:
            date = datetime.fromisoformat(metric.timestamp).date().isoformat()
            daily_quality[date].append(metric.quality_score)
        
        # Calculate daily averages
        return {
            date: statistics.mean(scores)
            for date, scores in daily_quality.items()
        }

    def generate_report(self) -> Dict[str, Any]:
        """Generate a comprehensive report."""
        return {
            "performance_metrics": self.get_performance_metrics(),
            "language_statistics": self.get_language_statistics(),
            "error_statistics": self.get_error_statistics(),
            "quality_trends": self.get_quality_trends(),
            "daily_stats": dict(self.daily_stats)
        } 