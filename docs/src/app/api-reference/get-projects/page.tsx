import type { Metadata } from "next";
import { RequestExample } from "@/components/request-example";
import { ResponseExample } from "@/components/response-example";

export const metadata: Metadata = {
  title: "Mintly | Get Projects",
  description: "List the projects created within a channel via the Mintly API.",
};

const queryParams = [
  {
    name: "channelId",
    type: "string",
    required: true,
    description: "The ID of the channel to list projects from.",
  },
  {
    name: "titleFilter",
    type: "string | null",
    required: false,
    description: "Filters projects by title. Defaults to no filter.",
  },
  {
    name: "pageIndex",
    type: "number",
    required: false,
    description: "Zero-based page index for pagination. Defaults to 0.",
  },
];

const curlCode = `curl --request GET \\
  --url 'https://api.mintly.app/api/v1/projects?channelId=<channel-id>' \\
  --header 'Authorization: <api-key>'`;

const successJson = `{
  "projects": [
    {
      "id": "prj_123",
      "title": "My video",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "status": "SUCCESS",
      "createdAt": "2026-09-01T12:00:00.000Z",
      "clipCount": 4,
      "owner": {
        "name": "Jane Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    }
  ],
  "meta": {
    "totalCount": 1,
    "totalPages": 1
  }
}`;

const errorJson = (message: string) => `{
  "message": "${message}"
}`;

export default function GetProjects() {
  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">Endpoints</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              GET
            </span>
            <code className="font-mono text-sm text-muted-foreground">
              /api/v1/projects
            </code>
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Get Projects
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Returns the paginated list of projects created within a channel.
          </p>

          <h2 className="mt-10 text-2xl font-bold tracking-tight">
            Query Parameters
          </h2>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border">
            {queryParams.map((param) => (
              <div
                key={param.name}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
                      {param.name}
                    </code>
                    {param.required ? (
                      <span className="text-xs text-muted-foreground">
                        required
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {param.description}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {param.type}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold tracking-tight">
            Response
          </h2>
          <p className="mt-4 text-muted-foreground">
            Returns a{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
              200
            </code>{" "}
            with the matching projects and pagination metadata.
          </p>
        </div>

        <div className="min-w-0 flex flex-col gap-4 self-start lg:sticky lg:top-24">
          <RequestExample title="Get Projects" code={curlCode}>
            curl --request <span className="text-sky-300">GET</span> \
            {"\n  "}--url{" "}
            <span className="text-orange-300">
              &apos;https://api.mintly.app/api/v1/projects?channelId=&lt;channel-id&gt;&apos;
            </span>{" "}
            \{"\n  "}--header{" "}
            <span className="text-orange-300">
              &apos;Authorization: &lt;api-key&gt;&apos;
            </span>
          </RequestExample>

          <ResponseExample
            examples={[
              {
                status: "200",
                code: successJson,
                content: (
                  <>
                    {"{"}
                    {"\n  "}
                    <span className="text-sky-300">&quot;projects&quot;</span>
                    {": ["}
                    {"\n    {"}
                    {"\n      "}
                    <span className="text-sky-300">&quot;id&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;prj_123&quot;
                    </span>
                    {","}
                    {"\n      "}
                    <span className="text-sky-300">&quot;title&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;My video&quot;
                    </span>
                    {","}
                    {"\n      "}
                    <span className="text-sky-300">
                      &quot;thumbnailUrl&quot;
                    </span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;https://example.com/thumbnail.jpg&quot;
                    </span>
                    {","}
                    {"\n      "}
                    <span className="text-sky-300">&quot;status&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;SUCCESS&quot;
                    </span>
                    {","}
                    {"\n      "}
                    <span className="text-sky-300">
                      &quot;createdAt&quot;
                    </span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;2026-09-01T12:00:00.000Z&quot;
                    </span>
                    {","}
                    {"\n      "}
                    <span className="text-sky-300">
                      &quot;clipCount&quot;
                    </span>
                    {": 4,"}
                    {"\n      "}
                    <span className="text-sky-300">&quot;owner&quot;</span>
                    {": {"}
                    {"\n        "}
                    <span className="text-sky-300">&quot;name&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;Jane Doe&quot;
                    </span>
                    {","}
                    {"\n        "}
                    <span className="text-sky-300">
                      &quot;avatarUrl&quot;
                    </span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;https://example.com/avatar.jpg&quot;
                    </span>
                    {"\n      }"}
                    {"\n    }"}
                    {"\n  ],"}
                    {"\n  "}
                    <span className="text-sky-300">&quot;meta&quot;</span>
                    {": {"}
                    {"\n    "}
                    <span className="text-sky-300">
                      &quot;totalCount&quot;
                    </span>
                    {": 1,"}
                    {"\n    "}
                    <span className="text-sky-300">
                      &quot;totalPages&quot;
                    </span>
                    {": 1"}
                    {"\n  }"}
                    {"\n}"}
                  </>
                ),
              },
              {
                status: "400",
                code: errorJson("Invalid query parameters."),
                content: (
                  <>
                    {"{"}
                    {"\n  "}
                    <span className="text-sky-300">&quot;message&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;Invalid query parameters.&quot;
                    </span>
                    {"\n}"}
                  </>
                ),
              },
              {
                status: "401",
                code: errorJson("Invalid or missing API key."),
                content: (
                  <>
                    {"{"}
                    {"\n  "}
                    <span className="text-sky-300">&quot;message&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;Invalid or missing API key.&quot;
                    </span>
                    {"\n}"}
                  </>
                ),
              },
              {
                status: "404",
                code: errorJson("Channel not found."),
                content: (
                  <>
                    {"{"}
                    {"\n  "}
                    <span className="text-sky-300">&quot;message&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;Channel not found.&quot;
                    </span>
                    {"\n}"}
                  </>
                ),
              },
              {
                status: "500",
                code: errorJson("Internal server error."),
                content: (
                  <>
                    {"{"}
                    {"\n  "}
                    <span className="text-sky-300">&quot;message&quot;</span>
                    {": "}
                    <span className="text-orange-300">
                      &quot;Internal server error.&quot;
                    </span>
                    {"\n}"}
                  </>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
