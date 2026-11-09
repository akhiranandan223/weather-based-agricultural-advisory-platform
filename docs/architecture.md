# System Architecture Specification
## Weather-Based Agricultural Advisory Platform
### SR University — Academic Year 2026–2027

---

## 1. Architectural Overview

The Weather-Based Agricultural Advisory Platform follows a modern **three-tier microservices architecture** containerized via Docker and orchestrated through Kubernetes.

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier"]
        Browser["Web Browser (Desktop / Mobile)"]
    end

    subgraph IngressTier ["Ingress & Web Server Tier"]
        Nginx["Nginx Reverse Proxy (Frontend Container)<br/>Port 80 / NodePort 30080"]
    end

    subgraph AppTier ["Application Backend Tier"]
        Backend["Express & Node.js REST API Server<br/>Port 5000 / ClusterIP"]
        AuthM["JWT & Role Authorization Engine"]
        WeathSvc["Weather Ingestion Service"]
        AdvEng["Crop Advisory Engine"]
        AlertEng["Alert Threshold Service"]
        RepEng["Reporting Engine (CSV / PDF)"]
    end

    subgraph DataTier ["Persistence & External Services Tier"]
        MongoDB[("MongoDB 7.0 Community Database<br/>Port 27017 / ClusterIP")]
        OWM["OpenWeatherMap API (External Cloud)"]
    end

    Browser -->|HTTP Requests| Nginx
    Nginx -->|SPA Static Assets| Browser
    Nginx -->|Reverse Proxy /api/*| Backend
    Backend --> AuthM
    Backend --> WeathSvc
    Backend --> AdvEng
    Backend --> AlertEng
    Backend --> RepEng
    Backend -->|Mongoose Connection| MongoDB
    WeathSvc -->|HTTPS / 2.5 API| OWM
```

---

## 2. Pod Topology in Kubernetes (Minikube)

```mermaid
graph TB
    subgraph K8sCluster ["Minikube Local Kubernetes Cluster"]
        subgraph FrontendGroup ["Frontend Deployment (Replicas: 2)"]
            F_Pod1["Pod: frontend-pod-1<br/>Port 80 (Nginx)"]
            F_Pod2["Pod: frontend-pod-2<br/>Port 80 (Nginx)"]
            F_Svc["Service: frontend-service<br/>NodePort: 30080"]
            F_Svc --> F_Pod1
            F_Svc --> F_Pod2
        end

        subgraph BackendGroup ["Backend Deployment (Replicas: 2)"]
            B_Pod1["Pod: backend-pod-1<br/>Port 5000 (Node.js)"]
            B_Pod2["Pod: backend-pod-2<br/>Port 5000 (Node.js)"]
            B_Svc["Service: backend-service<br/>ClusterIP: 5000"]
            B_Svc --> B_Pod1
            B_Svc --> B_Pod2
        end

        subgraph DBGroup ["MongoDB Stateful / Deployment"]
            DB_Pod["Pod: mongodb-pod<br/>Port 27017 (Mongo 7.0)"]
            DB_Svc["Service: mongodb-service<br/>ClusterIP: 27017"]
            PVC["PersistentVolumeClaim: mongodb-pvc (2Gi)"]
            PV["PersistentVolume: mongodb-pv (Local Storage)"]
            DB_Svc --> DB_Pod
            DB_Pod --> PVC
            PVC --> PV
        end

        subgraph ConfigSec ["Configuration & Secrets"]
            CM["ConfigMap: agri-config"]
            SEC["Secret: agri-secret"]
            CM -.-> B_Pod1 & B_Pod2
            SEC -.-> B_Pod1 & B_Pod2
        end

        F_Pod1 & F_Pod2 -->|Proxy /api/*| B_Svc
        B_Pod1 & B_Pod2 -->|Connect to DB| DB_Svc
    end
```

---

## 3. Communication Protocols

| Source | Destination | Protocol | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| Browser | Nginx (Frontend) | HTTP / HTTPS | 80 / 3000 / 30080 | Single-Page Application delivery |
| Nginx | Node.js (Backend) | HTTP REST | 5000 | `/api/*` reverse proxy forwarding |
| Node.js | MongoDB | MongoDB Wire Protocol | 27017 | Read/write CRUD operations via Mongoose |
| Node.js | OpenWeatherMap | HTTPS | 443 | Real-time weather and 5-day forecast sync |

---

## 4. Scalability & Fault Tolerance

1. **Dual Replicas:** Both frontend and backend deployments specify `replicas: 2` with automatic pod scheduling across available nodes.
2. **Health Probes:**
   - **Readiness Probes:** Kubernetes withholds traffic until `/health` returns HTTP 200.
   - **Liveness Probes:** Deadlocked or out-of-memory processes are automatically terminated and restarted.
3. **Database Volume Resilience:** Persistent Volume Claims decouple database records from container lifecycles.
