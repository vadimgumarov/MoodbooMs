# CycleAware Platform - Complete Project Structure

```
cycle-aware/
├── .github/
│   └── workflows/
│       ├── ios.yml
│       ├── android.yml
│       ├── macos.yml
│       └── web.yml
├── packages/
│   ├── core/
│   │   ├── models/
│   │   │   ├── user.ts
│   │   │   ├── cycle.ts
│   │   │   ├── notification.ts
│   │   │   └── sharing.ts
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── cycle.ts
│   │   │   ├── notification.ts
│   │   │   └── sharing.ts
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── encryption.ts
│   │       └── validation.ts
│   └── ui/
│       ├── components/
│       │   ├── icons/
│       │   ├── widgets/
│       │   └── settings/
│       └── themes/
├── apps/
│   ├── ios/
│   │   ├── CycleAware/
│   │   │   ├── App/
│   │   │   ├── Features/
│   │   │   │   ├── Tracking/
│   │   │   │   ├── Settings/
│   │   │   │   └── Sharing/
│   │   │   ├── Services/
│   │   │   └── Extensions/
│   │   └── CycleAwareTests/
│   ├── android/
│   │   ├── app/
│   │   │   ├── src/
│   │   │   │   ├── main/
│   │   │   │   │   ├── java/
│   │   │   │   │   │   └── com/cycleaware/
│   │   │   │   │   │       ├── features/
│   │   │   │   │   │       ├── services/
│   │   │   │   │   │       └── utils/
│   │   │   │   │   └── res/
│   │   │   │   └── test/
│   │   │   └── build.gradle
│   │   └── build.gradle
│   ├── macos/
│   │   ├── CycleAware/
│   │   │   ├── App/
│   │   │   ├── MenuBar/
│   │   │   ├── Preferences/
│   │   │   └── Services/
│   │   └── CycleAwareTests/
│   ├── web/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   └── public/
│   └── browser-extension/
│       ├── chrome/
│       ├── firefox/
│       └── safari/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── cycles.ts
│   │   │   │   ├── users.ts
│   │   │   │   └── sharing.ts
│   │   │   ├── middleware/
│   │   │   └── validators/
│   │   ├── services/
│   │   │   ├── auth/
│   │   │   ├── cycle/
│   │   │   ├── notification/
│   │   │   └── sharing/
│   │   ├── models/
│   │   │   ├── user.ts
│   │   │   ├── cycle.ts
│   │   │   └── notification.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── encryption.ts
│   │       └── validation.ts
│   └── tests/
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── docker/
│       ├── api/
│       ├── web/
│       └── docker-compose.yml
└── docs/
    ├── api/
    ├── architecture/
    ├── deployment/
    └── development/
```

## Component Details

### Shared Packages
- `core`: Business logic, models, and utilities shared across platforms
- `ui`: Common UI components and theming

### Platform Apps
- `ios`: Native iOS app with HealthKit integration
- `android`: Native Android app with Health Connect
- `macos`: Menu bar app (MVP)
- `web`: Progressive Web App
- `browser-extension`: Cross-browser support

### Backend Services
- RESTful API with GraphQL support
- Authentication and authorization
- Real-time updates via WebSocket
- Data synchronization
- Analytics and monitoring

### Infrastructure
- Cloud deployment configurations
- Container orchestration
- CI/CD pipelines
- Monitoring and logging

## Key Files

### Core Package
```typescript
// packages/core/models/cycle.ts
export interface CycleData {
  userId: string;
  startDate: Date;
  duration: number;
  phase: CyclePhase;
  symptoms?: string[];
  notes?: string;
}

export enum CyclePhase {
  MENSTRUAL,
  FOLLICULAR,
  OVULATORY,
  LUTEAL
}
```

### iOS App
```swift
// apps/ios/CycleAware/Features/Tracking/CycleTrackingView.swift
import SwiftUI
import CorePackage

struct CycleTrackingView: View {
    @StateObject private var viewModel: CycleTrackingViewModel
    
    var body: some View {
        // TODO: Implement tracking view
    }
}
```

### Android App
```kotlin
// apps/android/app/src/main/java/com/cycleaware/features/tracking/CycleTrackingActivity.kt
class CycleTrackingActivity : AppCompatActivity() {
    private lateinit var viewModel: CycleTrackingViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // TODO: Initialize tracking view
    }
}
```

### Backend API
```typescript
// backend/src/api/routes/cycles.ts
import { Router } from 'express';
import { CycleController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.get('/', authenticate, CycleController.getCycles);
router.post('/', authenticate, CycleController.createCycle);
// TODO: Implement remaining endpoints

export default router;
```

### Infrastructure
```hcl
# infrastructure/terraform/main.tf
provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
  // TODO: Configure networking
}

module "ecs" {
  source = "./modules/ecs"
  // TODO: Configure container services
}
```