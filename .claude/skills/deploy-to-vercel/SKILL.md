---
name: deploy-to-vercel
description: Deploy the application to production
---

Deploy the application:
1. Pull the latest changes from main
2. Install dependencies and run tests
3. Build the Docker image
4. Tag it with the current commit SHA
5. Push to the container registry
6. Update the cluster, wait for rollout
7. Run health checks against the endpoint