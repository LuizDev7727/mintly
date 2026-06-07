import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const imageTag = config.require("imageTag");

// ECR Repository
const repo = new aws.ecr.Repository("api-repo", {
  name: "mintly-api-staging",
  imageTagMutability: "MUTABLE",
  forceDelete: true,
});

// ECS Cluster
const cluster = new aws.ecs.Cluster("api-cluster", {
  name: "mintly-api-staging-cluster",
});

// IAM Role para execução de tasks
const taskExecutionRole = new aws.iam.Role("api-task-execution-role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Principal: {
          Service: "ecs-tasks.amazonaws.com",
        },
      },
    ],
  }),
});

new aws.iam.RolePolicyAttachment("api-task-execution-role-policy", {
  role: taskExecutionRole.name,
  policyArn: aws.iam.ManagedPolicy.AmazonECSTaskExecutionRolePolicy,
});

// Task Definition
const taskDefinition = new aws.ecs.TaskDefinition("api-task", {
  family: "minha-api-task",
  cpu: "256",
  memory: "512",
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],
  executionRoleArn: taskExecutionRole.arn,
  containerDefinitions: pulumi.interpolate`[
    {
      "name": "mintly-api-staging",
      "image": "${repo.repositoryUrl}:${imageTag}",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "${process.env.DATABASE_URL}"
        },
        {
          "name": "BETTER_AUTH_URL",
          "value": "${process.env.BETTER_AUTH_URL}"
        },
        {
          "name": "BETTER_AUTH_SECRET",
          "value": "${process.env.BETTER_AUTH_SECRET}"
        },
        {
          "name": "ALLOWED_ORIGIN",
          "value": "${process.env.ALLOWED_ORIGIN}"
        },
        {
          "name": "OTEL_SERVICE_NAME",
          "value": "${process.env.OTEL_SERVICE_NAME}"
        },
        {
          "name": "OTEL_TRACES_EXPORTER",
          "value": "${process.env.OTEL_TRACES_EXPORTER}"
        },
        {
          "name": "OTEL_EXPORTER_OTLP_ENDPOINT",
          "value": "${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}"
        },
        {
          "name": "OTEL_EXPORTER_OTLP_HEADERS",
          "value": "${process.env.OTEL_EXPORTER_OTLP_HEADERS}"
        }
      ]
    }
  ]`,
});

// VPC padrão
const vpc = aws.ec2.getVpc({ default: true });
const subnets = vpc.then((v) =>
  aws.ec2.getSubnets({
    filters: [{ name: "vpc-id", values: [v.id] }],
  }),
);

// Security Group
const sg = new aws.ec2.SecurityGroup("mintly-api-staging-sg", {
  vpcId: vpc.then((v) => v.id),
  ingress: [
    {
      protocol: "tcp",
      fromPort: 3000,
      toPort: 3000,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
});

// ECS Service
const service = new aws.ecs.Service("mintly-api-staging-service", {
  name: "mintly-api-staging-service",
  cluster: cluster.arn,
  taskDefinition: taskDefinition.arn,
  desiredCount: 1,
  launchType: "FARGATE",
  networkConfiguration: {
    assignPublicIp: true,
    subnets: subnets.then((s) => s.ids),
    securityGroups: [sg.id],
  },
});

export const repositoryUrl = repo.repositoryUrl;
