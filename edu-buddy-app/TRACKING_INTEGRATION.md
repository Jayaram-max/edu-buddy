# Real-Time User Tracking System - Integration Guide

## Overview
Your Edu Buddy AI app now has a comprehensive real-time user tracking and analytics system. This system tracks user activities, engagement metrics, sessions, and provides detailed analytics.

## Components Created

### 1. **Database Schema** (`database/tracking-schema.sql`)
- `user_sessions` - Track user sessions with duration and device info
- `user_activity_logs` - Log all user activities (quiz, notes, chat, etc.)
- `user_events` - Real-time event tracking
- `user_engagement_metrics` - Aggregate engagement data per user
- `daily_user_statistics` - Daily breakdown of activities
- `page_views` - Track page visits and time spent
- `user_heatmap_data` - Mouse click/hover heatmaps
- `page_performance_metrics` - Page load performance data
- `user_retention` - Cohort and retention analysis
- `funnel_events` - Track user funnels (signup to quiz, etc.)
- `online_users` - Real-time online user tracking

### 2. **Tracking Library** (`src/lib/tracking.js`)
Core tracking functions:
- `createUserSession()` - Initialize tracking session
- `logActivity()` - Log any user activity
- `trackEvent()` - Track specific events
- `trackPageView()` - Track page navigation
- `trackQuizStarted/Completed()` - Quiz tracking
- `trackNoteGenerated()` - Note tracking
- `trackChatMessage()` - Chat tracking
- `updateEngagementMetrics()` - Calculate user engagement
- `getOnlineUsers()` - Get currently active users

### 3. **Tracking Context** (`src/context/TrackingContext.jsx`)
React context that provides:
- Session management
- Activity logging hooks
- Event tracking
- Funnel tracking
- Automatic page navigation tracking

### 4. **Analytics Dashboard** (`src/pages/Analytics.jsx`)
Real-time analytics page showing:
- Overview metrics (sessions, study time, quizzes, engagement)
- Recent activities log
- Engagement metrics
- Daily breakdown
- Activity breakdown by type

## Setup Instructions

### Step 1: Run Database Schema
```sql
-- Copy the contents of database/tracking-schema.sql
-- Paste and run in Supabase SQL Editor
-- This creates all tracking tables and views
```

### Step 2: Update App.jsx
Already done! The `TrackingProvider` now wraps your app.

### Step 3: Use Tracking in Components

#### Track Page Views (Auto in TrackingContext)
```jsx
import { useTracking } from '../context/TrackingContext'

export default function MyPage() {
  const { trackPageNavigation } = useTracking()

  useEffect(() => {
    trackPageNavigation('/my-page', 'Page Title')
  }, [])
}
```

#### Track Quiz Events
```jsx
const { trackQuizEvent } = useTracking()

// When quiz starts
await trackQuizEvent(quizId, 'start', { subject: 'Math' })

// When quiz completes
await trackQuizEvent(quizId, 'complete', {
  score: 85,
  totalPoints: 100
})
```

#### Track Notes
```jsx
const { trackNoteEvent } = useTracking()

await trackNoteEvent('summary', noteContent.length)
```

#### Track Chat Messages
```jsx
const { trackChatEvent } = useTracking()

await trackChatEvent(conversationId, messageLength, 'neutral')
```

#### Track Custom Events
```jsx
const { trackEvent } = useTracking()

await trackEvent('custom_event', {
  eventName: 'Feature Used',
  value: 42,
  properties: { feature: 'smart_notes' }
})
```

#### Track Funnels
```jsx
const { trackFunnelStep } = useTracking()

// Step 1: User starts signup
await trackFunnelStep('signup_to_quiz', 1, 'signup_view')

// Step 2: User completes signup
await trackFunnelStep('signup_to_quiz', 2, 'email_verified')

// Step 3: User takes first quiz
await trackFunnelStep('signup_to_quiz', 3, 'quiz_started')
```

## Automatic Tracking

The system automatically tracks:
- ✅ User login/logout
- ✅ Page navigation
- ✅ Session creation and destruction
- ✅ Session duration
- ✅ Device info (browser, OS, device type)
- ✅ IP address
- ✅ Online user status (30-second heartbeat)
- ✅ User retention cohorts

## Integration Checklist

- [x] Database schema created
- [x] Tracking library built
- [x] TrackingContext created
- [x] App.jsx wrapped with TrackingProvider
- [x] Analytics dashboard created
- [x] Chat.jsx integrated with tracking
- [ ] Quiz.jsx - Add tracking
- [ ] SmartNotes.jsx - Add tracking
- [ ] Dashboard.jsx - Add tracking
- [ ] Progress.jsx - Add tracking

## Quick Integration for Quiz Page

```jsx
import { useTracking } from '../context/TrackingContext'

export default function Quiz() {
  const { trackPageNavigation, trackQuizEvent } = useTracking()

  useEffect(() => {
    trackPageNavigation('/quiz', 'Quiz')
  }, [])

  const handleQuizStart = async (quizId, subject) => {
    await trackQuizEvent(quizId, 'start', { subject })
  }

  const handleQuizComplete = async (quizId, score, total) => {
    await trackQuizEvent(quizId, 'complete', {
      score,
      totalPoints: total
    })
  }
}
```

## Quick Integration for SmartNotes Page

```jsx
import { useTracking } from '../context/TrackingContext'

export default function SmartNotes() {
  const { trackPageNavigation, trackNoteEvent } = useTracking()

  useEffect(() => {
    trackPageNavigation('/notes', 'Smart Notes')
  }, [])

  const handleGenerateNotes = async (noteType, content) => {
    await trackNoteEvent(noteType, content.length)
  }
}
```

## Analytics Dashboard Usage

Navigate to `/analytics` to see:
1. **Overview Tab**: Key metrics at a glance
2. **Activity Tab**: Recent user activities with timestamps
3. **Engagement Tab**: Detailed engagement metrics and daily breakdown
4. **Time Tab**: Peak activity hours and activity breakdown

Time range filters available: 7D, 30D, 90D, All

## Real-Time Features

### Online Users
Get real-time count of active users:
```jsx
import * as tracking from '../lib/tracking'

const onlineUsers = await tracking.getOnlineUsers()
// Returns users active in last 5 minutes
```

### Daily Statistics
Automatic daily stats tracking:
- Study time per day
- Sessions per day
- Quizzes taken
- Notes created
- Chat messages
- Average quiz scores

### Engagement Levels
Automatically calculated based on:
- Session count
- Total study time
- Activity frequency

Levels: `low`, `medium`, `high`, `very_high`

## Database Views

Pre-built views for quick insights:
- `active_sessions_view` - Current active sessions
- `daily_active_users_view` - DAU metrics
- `user_engagement_summary_view` - User engagement status

Use in Supabase queries:
```jsx
const { data } = await supabase
  .from('user_engagement_summary_view')
  .select('*')
  .eq('user_status', 'online')
```

## Performance Tracking

Optional: Track page performance metrics:
```jsx
import * as tracking from '../lib/tracking'

const perfMetrics = {
  loadTime: performance.now(),
  fcp: 1200, // First Contentful Paint
  lcp: 2100, // Largest Contentful Paint
  tti: 1800, // Time to Interactive
  cls: 0.05  // Cumulative Layout Shift
}

await tracking.trackPerformance(userId, pageRoute, perfMetrics)
```

## Analytics Queries

Get user analytics programmatically:
```jsx
import * as tracking from '../lib/tracking'

// Get engagement metrics
const metrics = await tracking.updateEngagementMetrics(userId)

// Get daily stats
const dailyStats = await tracking.getDailyStatistics(userId)

// Get online users
const onlineUsers = await tracking.getOnlineUsers()
```

## Best Practices

1. ✅ Always track important user actions
2. ✅ Include meaningful event names
3. ✅ Add metadata to events for better insights
4. ✅ Use trackFunnelStep for conversion funnels
5. ✅ Monitor engagement_level for user health
6. ✅ Use retention cohorts to identify trends
7. ✅ Check online_users for real-time stats

## Security Notes

- All tracking data tied to authenticated users only
- IP addresses stored for analytics only
- User agents captured for device analytics
- No sensitive data stored in event metadata
- All timestamps in UTC timezone

## Next Steps

1. Run the database schema in Supabase
2. Integrate tracking into remaining pages (Quiz, Notes, Dashboard)
3. Monitor Analytics dashboard
4. Set up alerts for engagement drops
5. Create custom dashboards with Supabase studio or your own UI

---

**Tracking System Ready!** 🎉 Your app now has enterprise-grade user tracking and analytics.
