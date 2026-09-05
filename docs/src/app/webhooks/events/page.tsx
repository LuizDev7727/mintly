import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";

export const metadata: Metadata = {
  title: "Mintly | Webhook Events",
  description: "List of webhook events sent by Mintly.",
};

export default function WebhookEvents() {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <p className="text-sm font-semibold text-primary">Events</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">Events</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Documentation about the Mintly webhook events
      </p>
      <p className="mt-4 text-muted-foreground">
        Below you can check the types of events that are available to be
        used in your webhooks.
      </p>

      <section id="post-created" className="mt-12">
        <h3 className="text-xl font-bold tracking-tight">Post created</h3>
        <p className="mt-2 text-muted-foreground">
          This event is triggered when a new post is created.
        </p>
        <div className="mt-4">
          <EventCard
            types={{
              code: `export interface PostCreatedWebhookEvent {
  trigger: "post.created";
  payload: {
    message: string;
  };
}`,
              content: (
                <>
                  export interface{" "}
                  <span className="text-sky-300">
                    PostCreatedWebhookEvent
                  </span>{" "}
                  {"{"}
                  {"\n  trigger: "}
                  <span className="text-orange-300">
                    &quot;post.created&quot;
                  </span>
                  {";"}
                  {"\n  payload: {"}
                  {"\n    message: "}
                  <span className="text-emerald-300">string</span>
                  {";"}
                  {"\n  };"}
                  {"\n}"}
                </>
              ),
            }}
            example={{
              code: `{
  "trigger": "post.created",
  "payload": {
    "message": "Your post has been created."
  }
}`,
              content: (
                <>
                  {"{"}
                  {"\n  "}
                  <span className="text-sky-300">&quot;trigger&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;post.created&quot;
                  </span>
                  {","}
                  {"\n  "}
                  <span className="text-sky-300">&quot;payload&quot;</span>
                  {": {"}
                  {"\n    "}
                  <span className="text-sky-300">&quot;message&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;Your post has been created.&quot;
                  </span>
                  {"\n  }"}
                  {"\n}"}
                </>
              ),
            }}
            zodSchema={{
              code: `export const postCreatedSchema = z.object({
  message: z.string(),
})`,
              content: (
                <>
                  export const{" "}
                  <span className="text-sky-300">postCreatedSchema</span>{" "}
                  = z.object({"{"}
                  {"\n  message: "}
                  <span className="text-emerald-300">z.string()</span>
                  {","}
                  {"\n})"}
                </>
              ),
            }}
          />
        </div>
      </section>

      <section id="post-posted" className="mt-12">
        <h3 className="text-xl font-bold tracking-tight">Post posted</h3>
        <p className="mt-2 text-muted-foreground">
          This event is triggered when a post is successfully published to
          its destination.
        </p>
        <div className="mt-4">
          <EventCard
            types={{
              code: `export interface PostPostedWebhookEvent {
  trigger: "post.posted";
  payload: {
    title: string;
    description: string;
    tags: string[];
  };
}`,
              content: (
                <>
                  export interface{" "}
                  <span className="text-sky-300">
                    PostPostedWebhookEvent
                  </span>{" "}
                  {"{"}
                  {"\n  trigger: "}
                  <span className="text-orange-300">
                    &quot;post.posted&quot;
                  </span>
                  {";"}
                  {"\n  payload: {"}
                  {"\n    title: "}
                  <span className="text-emerald-300">string</span>
                  {";"}
                  {"\n    description: "}
                  <span className="text-emerald-300">string</span>
                  {";"}
                  {"\n    tags: "}
                  <span className="text-emerald-300">string[]</span>
                  {";"}
                  {"\n  };"}
                  {"\n}"}
                </>
              ),
            }}
            example={{
              code: `{
  "trigger": "post.posted",
  "payload": {
    "title": "My awesome video",
    "description": "Check out this new upload!",
    "tags": ["marketing", "launch"]
  }
}`,
              content: (
                <>
                  {"{"}
                  {"\n  "}
                  <span className="text-sky-300">&quot;trigger&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;post.posted&quot;
                  </span>
                  {","}
                  {"\n  "}
                  <span className="text-sky-300">&quot;payload&quot;</span>
                  {": {"}
                  {"\n    "}
                  <span className="text-sky-300">&quot;title&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;My awesome video&quot;
                  </span>
                  {","}
                  {"\n    "}
                  <span className="text-sky-300">
                    &quot;description&quot;
                  </span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;Check out this new upload!&quot;
                  </span>
                  {","}
                  {"\n    "}
                  <span className="text-sky-300">&quot;tags&quot;</span>
                  {": ["}
                  <span className="text-orange-300">
                    &quot;marketing&quot;
                  </span>
                  {", "}
                  <span className="text-orange-300">&quot;launch&quot;</span>
                  {"]"}
                  {"\n  }"}
                  {"\n}"}
                </>
              ),
            }}
            zodSchema={{
              code: `export const postPostedSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
})`,
              content: (
                <>
                  export const{" "}
                  <span className="text-sky-300">postPostedSchema</span> =
                  z.object({"{"}
                  {"\n  title: "}
                  <span className="text-emerald-300">z.string()</span>
                  {","}
                  {"\n  description: "}
                  <span className="text-emerald-300">z.string()</span>
                  {","}
                  {"\n  tags: "}
                  <span className="text-emerald-300">
                    z.array(z.string())
                  </span>
                  {","}
                  {"\n})"}
                </>
              ),
            }}
          />
        </div>
      </section>

      <section id="post-failed" className="mt-12">
        <h3 className="text-xl font-bold tracking-tight">Post failed</h3>
        <p className="mt-2 text-muted-foreground">
          This event is triggered when a post fails to be published.
        </p>
        <div className="mt-4">
          <EventCard
            types={{
              code: `export interface PostFailedWebhookEvent {
  trigger: "post.failed";
  payload: {
    message: string;
  };
}`,
              content: (
                <>
                  export interface{" "}
                  <span className="text-sky-300">
                    PostFailedWebhookEvent
                  </span>{" "}
                  {"{"}
                  {"\n  trigger: "}
                  <span className="text-orange-300">
                    &quot;post.failed&quot;
                  </span>
                  {";"}
                  {"\n  payload: {"}
                  {"\n    message: "}
                  <span className="text-emerald-300">string</span>
                  {";"}
                  {"\n  };"}
                  {"\n}"}
                </>
              ),
            }}
            example={{
              code: `{
  "trigger": "post.failed",
  "payload": {
    "message": "Your post failed to be published."
  }
}`,
              content: (
                <>
                  {"{"}
                  {"\n  "}
                  <span className="text-sky-300">&quot;trigger&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;post.failed&quot;
                  </span>
                  {","}
                  {"\n  "}
                  <span className="text-sky-300">&quot;payload&quot;</span>
                  {": {"}
                  {"\n    "}
                  <span className="text-sky-300">&quot;message&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;Your post failed to be published.&quot;
                  </span>
                  {"\n  }"}
                  {"\n}"}
                </>
              ),
            }}
            zodSchema={{
              code: `export const postFailedSchema = z.object({
  message: z.string(),
})`,
              content: (
                <>
                  export const{" "}
                  <span className="text-sky-300">postFailedSchema</span>{" "}
                  = z.object({"{"}
                  {"\n  message: "}
                  <span className="text-emerald-300">z.string()</span>
                  {","}
                  {"\n})"}
                </>
              ),
            }}
          />
        </div>
      </section>

      <section id="project-created" className="mt-12">
        <h3 className="text-xl font-bold tracking-tight">Project created</h3>
        <p className="mt-2 text-muted-foreground">
          This event is triggered when a new project is created.
        </p>
        <div className="mt-4">
          <EventCard
            types={{
              code: `export interface ProjectCreatedWebhookEvent {
  trigger: "project.created";
  payload: {
    message: string;
  };
}`,
              content: (
                <>
                  export interface{" "}
                  <span className="text-sky-300">
                    ProjectCreatedWebhookEvent
                  </span>{" "}
                  {"{"}
                  {"\n  trigger: "}
                  <span className="text-orange-300">
                    &quot;project.created&quot;
                  </span>
                  {";"}
                  {"\n  payload: {"}
                  {"\n    message: "}
                  <span className="text-emerald-300">string</span>
                  {";"}
                  {"\n  };"}
                  {"\n}"}
                </>
              ),
            }}
            example={{
              code: `{
  "trigger": "project.created",
  "payload": {
    "message": "A new project has been created."
  }
}`,
              content: (
                <>
                  {"{"}
                  {"\n  "}
                  <span className="text-sky-300">&quot;trigger&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;project.created&quot;
                  </span>
                  {","}
                  {"\n  "}
                  <span className="text-sky-300">&quot;payload&quot;</span>
                  {": {"}
                  {"\n    "}
                  <span className="text-sky-300">&quot;message&quot;</span>
                  {": "}
                  <span className="text-orange-300">
                    &quot;A new project has been created.&quot;
                  </span>
                  {"\n  }"}
                  {"\n}"}
                </>
              ),
            }}
            zodSchema={{
              code: `export const projectCreatedSchema = z.object({
  message: z.string(),
})`,
              content: (
                <>
                  export const{" "}
                  <span className="text-sky-300">
                    projectCreatedSchema
                  </span>{" "}
                  = z.object({"{"}
                  {"\n  message: "}
                  <span className="text-emerald-300">z.string()</span>
                  {","}
                  {"\n})"}
                </>
              ),
            }}
          />
        </div>
      </section>
    </div>
  );
}
