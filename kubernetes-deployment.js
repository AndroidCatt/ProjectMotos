// Kubernetes Deployment Configuration - v12.0 Final
// Configuración para deployment en Kubernetes con auto-scaling

class KubernetesDeployment {
    constructor() {
        this.deployments = this.generateDeploymentConfigs();
        this.services = this.generateServiceConfigs();
        this.ingress = this.generateIngressConfig();
        this.configMaps = this.generateConfigMaps();
        this.secrets = this.generateSecrets();

        console.log('[K8s] Deployment configurations generated');
    }

    // ============================================
    // DEPLOYMENT CONFIGURATIONS
    // ============================================

    generateDeploymentConfigs() {
        return {
            frontend: {
                apiVersion: 'apps/v1',
                kind: 'Deployment',
                metadata: {
                    name: 'chatbot-frontend',
                    labels: { app: 'chatbot', tier: 'frontend' }
                },
                spec: {
                    replicas: 3,
                    selector: { matchLabels: { app: 'chatbot', tier: 'frontend' } },
                    template: {
                        metadata: { labels: { app: 'chatbot', tier: 'frontend' } },
                        spec: {
                            containers: [{
                                name: 'frontend',
                                image: 'chatbot-frontend:v12.0',
                                ports: [{ containerPort: 80 }],
                                resources: {
                                    requests: { memory: '256Mi', cpu: '250m' },
                                    limits: { memory: '512Mi', cpu: '500m' }
                                },
                                livenessProbe: {
                                    httpGet: { path: '/health', port: 80 },
                                    initialDelaySeconds: 30,
                                    periodSeconds: 10
                                },
                                readinessProbe: {
                                    httpGet: { path: '/ready', port: 80 },
                                    initialDelaySeconds: 5,
                                    periodSeconds: 5
                                }
                            }]
                        }
                    }
                }
            },
            backend: {
                apiVersion: 'apps/v1',
                kind: 'Deployment',
                metadata: {
                    name: 'chatbot-backend',
                    labels: { app: 'chatbot', tier: 'backend' }
                },
                spec: {
                    replicas: 5,
                    selector: { matchLabels: { app: 'chatbot', tier: 'backend' } },
                    template: {
                        metadata: { labels: { app: 'chatbot', tier: 'backend' } },
                        spec: {
                            containers: [{
                                name: 'backend',
                                image: 'chatbot-backend:v12.0',
                                ports: [{ containerPort: 3000 }],
                                env: [
                                    { name: 'NODE_ENV', value: 'production' },
                                    { name: 'PORT', value: '3000' },
                                    {
                                        name: 'DB_PASSWORD',
                                        valueFrom: {
                                            secretKeyRef: { name: 'db-secret', key: 'password' }
                                        }
                                    }
                                ],
                                resources: {
                                    requests: { memory: '512Mi', cpu: '500m' },
                                    limits: { memory: '1Gi', cpu: '1000m' }
                                }
                            }]
                        }
                    }
                }
            },
            websocket: {
                apiVersion: 'apps/v1',
                kind: 'Deployment',
                metadata: {
                    name: 'chatbot-websocket',
                    labels: { app: 'chatbot', tier: 'websocket' }
                },
                spec: {
                    replicas: 3,
                    selector: { matchLabels: { app: 'chatbot', tier: 'websocket' } },
                    template: {
                        metadata: { labels: { app: 'chatbot', tier: 'websocket' } },
                        spec: {
                            containers: [{
                                name: 'websocket',
                                image: 'chatbot-websocket:v12.0',
                                ports: [{ containerPort: 8080 }],
                                resources: {
                                    requests: { memory: '256Mi', cpu: '250m' },
                                    limits: { memory: '512Mi', cpu: '500m' }
                                }
                            }]
                        }
                    }
                }
            }
        };
    }

    // ============================================
    // SERVICE CONFIGURATIONS
    // ============================================

    generateServiceConfigs() {
        return {
            frontend: {
                apiVersion: 'v1',
                kind: 'Service',
                metadata: { name: 'frontend-service' },
                spec: {
                    type: 'LoadBalancer',
                    selector: { app: 'chatbot', tier: 'frontend' },
                    ports: [{ port: 80, targetPort: 80, protocol: 'TCP' }]
                }
            },
            backend: {
                apiVersion: 'v1',
                kind: 'Service',
                metadata: { name: 'backend-service' },
                spec: {
                    type: 'ClusterIP',
                    selector: { app: 'chatbot', tier: 'backend' },
                    ports: [{ port: 3000, targetPort: 3000, protocol: 'TCP' }]
                }
            },
            websocket: {
                apiVersion: 'v1',
                kind: 'Service',
                metadata: { name: 'websocket-service' },
                spec: {
                    type: 'LoadBalancer',
                    selector: { app: 'chatbot', tier: 'websocket' },
                    ports: [{ port: 8080, targetPort: 8080, protocol: 'TCP' }]
                }
            }
        };
    }

    // ============================================
    // INGRESS CONFIGURATION
    // ============================================

    generateIngressConfig() {
        return {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: 'chatbot-ingress',
                annotations: {
                    'kubernetes.io/ingress.class': 'nginx',
                    'cert-manager.io/cluster-issuer': 'letsencrypt-prod'
                }
            },
            spec: {
                tls: [{
                    hosts: ['chatbot.example.com'],
                    secretName: 'chatbot-tls'
                }],
                rules: [{
                    host: 'chatbot.example.com',
                    http: {
                        paths: [
                            { path: '/', pathType: 'Prefix', backend: { service: { name: 'frontend-service', port: { number: 80 } } } },
                            { path: '/api', pathType: 'Prefix', backend: { service: { name: 'backend-service', port: { number: 3000 } } } },
                            { path: '/ws', pathType: 'Prefix', backend: { service: { name: 'websocket-service', port: { number: 8080 } } } }
                        ]
                    }
                }]
            }
        };
    }

    // ============================================
    // HORIZONTAL POD AUTOSCALER
    // ============================================

    generateHPAConfig() {
        return {
            backend: {
                apiVersion: 'autoscaling/v2',
                kind: 'HorizontalPodAutoscaler',
                metadata: { name: 'backend-hpa' },
                spec: {
                    scaleTargetRef: {
                        apiVersion: 'apps/v1',
                        kind: 'Deployment',
                        name: 'chatbot-backend'
                    },
                    minReplicas: 3,
                    maxReplicas: 10,
                    metrics: [
                        {
                            type: 'Resource',
                            resource: { name: 'cpu', target: { type: 'Utilization', averageUtilization: 70 } }
                        },
                        {
                            type: 'Resource',
                            resource: { name: 'memory', target: { type: 'Utilization', averageUtilization: 80 } }
                        }
                    ]
                }
            }
        };
    }

    // ============================================
    // CONFIGMAPS & SECRETS
    // ============================================

    generateConfigMaps() {
        return {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: { name: 'chatbot-config' },
            data: {
                'redis.host': 'redis-service',
                'redis.port': '6379',
                'elasticsearch.url': 'http://elasticsearch-service:9200',
                'log.level': 'info'
            }
        };
    }

    generateSecrets() {
        return {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: { name: 'db-secret' },
            type: 'Opaque',
            data: {
                username: Buffer.from('admin').toString('base64'),
                password: Buffer.from('super-secret-password').toString('base64')
            }
        };
    }

    // ============================================
    // EXPORT YAML
    // ============================================

    exportAllConfigs() {
        const configs = {
            deployments: this.deployments,
            services: this.services,
            ingress: this.ingress,
            configMaps: this.configMaps,
            secrets: this.secrets,
            hpa: this.generateHPAConfig()
        };

        return JSON.stringify(configs, null, 2);
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.KubernetesDeployment = KubernetesDeployment;
    window.k8sDeployment = new KubernetesDeployment();
}
