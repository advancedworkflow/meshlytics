import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectFramework } from "./framework.js";

let rootDir: string;

function writePackageJson(deps: Record<string, string> = {}, devDeps: Record<string, string> = {}) {
  writeFileSync(
    join(rootDir, "package.json"),
    JSON.stringify({ name: "fixture", dependencies: deps, devDependencies: devDeps }),
  );
}

beforeEach(() => {
  rootDir = mkdtempSync(join(tmpdir(), "meshlytics-discovery-"));
});

afterEach(() => {
  rmSync(rootDir, { recursive: true, force: true });
});

describe("detectFramework", () => {
  it("detects a Next.js App Router project with TypeScript", () => {
    writePackageJson({ next: "^15.0.0" });
    mkdirSync(join(rootDir, "app"));
    writeFileSync(join(rootDir, "tsconfig.json"), "{}");

    const info = detectFramework(rootDir);

    expect(info).toMatchObject({ framework: "next", router: "app", typescript: true });
    expect(info.appDir).toBe(join(rootDir, "app"));
  });

  it("falls back to the Pages Router when there is no app directory", () => {
    writePackageJson({ next: "^15.0.0" });
    mkdirSync(join(rootDir, "pages"));

    const info = detectFramework(rootDir);

    expect(info.router).toBe("pages");
    expect(info.appDir).toBe(join(rootDir, "pages"));
  });

  it("reports an unknown router when Next.js is present but neither directory exists", () => {
    writePackageJson({ next: "^15.0.0" });

    const info = detectFramework(rootDir);

    expect(info).toMatchObject({ framework: "next", router: "unknown", appDir: null });
  });

  it("reports an unknown framework outside of a Next.js project", () => {
    writePackageJson({ react: "^18.0.0" });
    mkdirSync(join(rootDir, "app"));

    const info = detectFramework(rootDir);

    expect(info).toMatchObject({ framework: "unknown", router: "unknown", appDir: null });
  });

  it("detects TypeScript from a devDependency even without a tsconfig.json", () => {
    writePackageJson({}, { typescript: "^5.7.2" });

    expect(detectFramework(rootDir).typescript).toBe(true);
  });

  it("treats a missing package.json as no framework and no TypeScript", () => {
    const info = detectFramework(rootDir);
    expect(info).toMatchObject({ framework: "unknown", typescript: false });
  });

  it("falls back to src/app when there is no top-level app directory", () => {
    writePackageJson({ next: "^15.0.0" });
    mkdirSync(join(rootDir, "src", "app"), { recursive: true });

    const info = detectFramework(rootDir);

    expect(info.router).toBe("app");
    expect(info.appDir).toBe(join(rootDir, "src", "app"));
  });

  it("prefers a top-level app directory over src/app when both exist", () => {
    writePackageJson({ next: "^15.0.0" });
    mkdirSync(join(rootDir, "app"));
    mkdirSync(join(rootDir, "src", "app"), { recursive: true });

    const info = detectFramework(rootDir);

    expect(info.appDir).toBe(join(rootDir, "app"));
  });
});
