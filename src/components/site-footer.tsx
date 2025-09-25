
export function SiteFooter() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-3">
          <a
            href="https://gitea.rosmoscato.xyz/ros/nextjs-boilerplate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on Gitea
          </a>
          <p>
            Agentic Coding Boilerplate powered by{" "}
            <span className="text-primary">
              RoMoS
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
