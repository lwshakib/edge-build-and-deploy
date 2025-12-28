import { createClient } from "@clickhouse/client";
import { CLICK_HOUSE_DB_URL } from "../env";

export const clickhouseClient = createClient({
  url: CLICK_HOUSE_DB_URL,
});

export async function createLogTable() {
  await clickhouseClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS log_events (
        event_id String,
        deployment_id String,
        log String,
        timestamp DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY (deployment_id, timestamp)
    `,
  });
}

export async function insertLog(data: {
  event_id: string;
  deployment_id: string;
  log: string;
}) {
  await clickhouseClient.insert({
    table: "log_events",
    values: [data],
    format: "JSONEachRow",
  });
}

export async function getLogs(deploymentId: string) {
  const result = await clickhouseClient.query({
    query:
      "SELECT event_id, deployment_id, log, timestamp FROM log_events WHERE deployment_id = {deployment_id:String} ORDER BY timestamp ASC",
    query_params: {
      deployment_id: deploymentId,
    },
    format: "JSONEachRow",
  });
  return await result.json();
}
