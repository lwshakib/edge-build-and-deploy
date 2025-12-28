import "dotenv/config";

export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const WEB_URL = process.env.WEB_URL;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
export const KAFKA_BROKER = process.env.KAFKA_BROKER!;
export const REDIS_USERNAME = process.env.REDIS_USERNAME!;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD!;
export const REDIS_HOST = process.env.REDIS_HOST!;
export const REDIS_PORT = process.env.REDIS_PORT!;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
export const GITHUB_APP_ID = process.env.GITHUB_APP_ID!;
export const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY!;
export const CLICK_HOUSE_DB_URL = process.env.CLICK_HOUSE_DB_URL!;

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
export const AWS_REGION = process.env.AWS_REGION!;
export const ECS_CLUSTER_ARN = process.env.ECS_CLUSTER_ARN!;
export const ECS_TASK_DEFINITION_ARN = process.env.ECS_TASK_DEFINITION_ARN!;
export const ECS_SUBNET_IDS =
  process.env.ECS_SUBNET_IDS?.split(",").filter(Boolean) || [];
export const ECS_SECURITY_GROUP_IDS =
  process.env.ECS_SECURITY_GROUP_IDS?.split(",").filter(Boolean) || [];
