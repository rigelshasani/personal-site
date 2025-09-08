/**
 * @jest-environment node
 */
import fs from "node:fs/promises";
import path from "node:path";
import { getAllProjects, ProjectMeta } from "@/lib/projects";

// Mock fs/promises  
jest.mock("node:fs/promises");

const mockFs = fs as jest.Mocked<typeof fs>;

describe("Projects", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock process.cwd
    jest.spyOn(process, "cwd").mockReturnValue("/test-project");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAllProjects", () => {
    it("should return empty array when no mdx files exist", async () => {
      mockFs.readdir.mockResolvedValue([]);

      const projects = await getAllProjects();

      expect(projects).toEqual([]);
      expect(mockFs.readdir).toHaveBeenCalledWith(expect.stringContaining("src/content/projects"));
    });

    it("should filter out non-mdx files", async () => {
      mockFs.readdir.mockResolvedValue([
        "project1.mdx",
        "README.md",
        "project2.mdx",
        "config.json"
      ] as any);
      
      // Mock file reading for mdx files only
      mockFs.readFile
        .mockResolvedValueOnce(`---
title: "Project 1"
date: "2023-01-01"
summary: "First project"
---
Content here`)
        .mockResolvedValueOnce(`---
title: "Project 2" 
date: "2023-02-01"
summary: "Second project"
---
More content`);

      const projects = await getAllProjects();

      expect(projects).toHaveLength(2);
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
      expect(mockFs.readFile).toHaveBeenCalledWith(expect.stringContaining("project1.mdx"), "utf8");
      expect(mockFs.readFile).toHaveBeenCalledWith(expect.stringContaining("project2.mdx"), "utf8");
    });

    it("should parse frontmatter correctly", async () => {
      mockFs.readdir.mockResolvedValue(["example.mdx"] as any);
      mockFs.readFile.mockResolvedValue(`---
title: "Awesome Project"
date: "2023-06-15"
summary: "A really awesome project"
status: "completed"
stack: ["React", "TypeScript", "Next.js"]
impact: "Increased conversion by 25%"
---
# Project Content

This is the project description.`);

      const projects = await getAllProjects();

      expect(projects).toHaveLength(1);
      
      const project = projects[0];
      expect(project.slug).toBe("example");
      expect(project.title).toBe("Awesome Project");
      expect(project.date).toBe("2023-06-15");
      expect(project.summary).toBe("A really awesome project");
      expect(project.status).toBe("completed");
      expect(project.stack).toEqual(["React", "TypeScript", "Next.js"]);
      expect(project.impact).toBe("Increased conversion by 25%");
    });

    it("should handle optional fields correctly", async () => {
      mockFs.readdir.mockResolvedValue(["minimal.mdx"] as any);
      mockFs.readFile.mockResolvedValue(`---
title: "Minimal Project"
date: "2023-03-10"
summary: "Basic project with minimal metadata"
---
Content`);

      const projects = await getAllProjects();

      expect(projects).toHaveLength(1);
      
      const project = projects[0];
      expect(project.slug).toBe("minimal");
      expect(project.title).toBe("Minimal Project");
      expect(project.date).toBe("2023-03-10");
      expect(project.summary).toBe("Basic project with minimal metadata");
      expect(project.status).toBeUndefined();
      expect(project.stack).toEqual([]); // Should default to empty array
      expect(project.impact).toBeUndefined();
    });

    it("should handle null stack as empty array", async () => {
      mockFs.readdir.mockResolvedValue(["null-stack.mdx"] as any);
      mockFs.readFile.mockResolvedValue(`---
title: "Project with null stack"
date: "2023-04-01"
summary: "Project metadata test"
stack: null
---
Content`);

      const projects = await getAllProjects();

      expect(projects[0].stack).toEqual([]);
    });

    it("should sort projects by date in descending order", async () => {
      mockFs.readdir.mockResolvedValue([
        "old-project.mdx",
        "new-project.mdx", 
        "middle-project.mdx"
      ] as any);

      mockFs.readFile
        .mockResolvedValueOnce(`---
title: "Old Project"
date: "2021-01-01"
summary: "Oldest project"
---`)
        .mockResolvedValueOnce(`---
title: "New Project"
date: "2023-12-01"
summary: "Newest project"
---`)
        .mockResolvedValueOnce(`---
title: "Middle Project"
date: "2022-06-15"
summary: "Middle project"
---`);

      const projects = await getAllProjects();

      expect(projects).toHaveLength(3);
      expect(projects[0].title).toBe("New Project");
      expect(projects[0].date).toBe("2023-12-01");
      expect(projects[1].title).toBe("Middle Project");
      expect(projects[1].date).toBe("2022-06-15");
      expect(projects[2].title).toBe("Old Project");
      expect(projects[2].date).toBe("2021-01-01");
    });

    it("should handle equal dates consistently", async () => {
      mockFs.readdir.mockResolvedValue([
        "project-a.mdx",
        "project-b.mdx"
      ] as any);

      mockFs.readFile
        .mockResolvedValueOnce(`---
title: "Project A"
date: "2023-05-01"
summary: "Project A"
---`)
        .mockResolvedValueOnce(`---
title: "Project B"
date: "2023-05-01"
summary: "Project B"
---`);

      const projects = await getAllProjects();

      expect(projects).toHaveLength(2);
      // Both should have same date, order may be preserved from file reading order
      expect(projects[0].date).toBe("2023-05-01");
      expect(projects[1].date).toBe("2023-05-01");
    });

    it("should handle filesystem read directory errors", async () => {
      mockFs.readdir.mockRejectedValue(new Error("Permission denied"));

      await expect(getAllProjects()).rejects.toThrow("Permission denied");
    });

    it("should handle file reading errors", async () => {
      mockFs.readdir.mockResolvedValue(["error.mdx"] as any);
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      await expect(getAllProjects()).rejects.toThrow("File not found");
    });

    it("should handle malformed frontmatter by throwing error", async () => {
      mockFs.readdir.mockResolvedValue(["malformed.mdx"] as any);
      mockFs.readFile.mockResolvedValue(`---
title: "Unterminated quote
date: "2023-01-01"
summary: "Test project"
---
Content`);

      // gray-matter will throw on malformed YAML
      await expect(getAllProjects()).rejects.toThrow();
    });

    it("should handle files without frontmatter", async () => {
      mockFs.readdir.mockResolvedValue(["no-frontmatter.mdx"] as any);
      mockFs.readFile.mockResolvedValue("# Just content without frontmatter");

      const projects = await getAllProjects();
      
      expect(projects).toHaveLength(1);
      const project = projects[0];
      expect(project.slug).toBe("no-frontmatter");
      expect(project.title).toBeUndefined();
      expect(project.date).toBeUndefined();
      expect(project.summary).toBeUndefined();
      expect(project.stack).toEqual([]); // Should still default to empty array
    });

    it("should use correct directory path from process.cwd", async () => {
      mockFs.readdir.mockResolvedValue([]);

      await getAllProjects();

      expect(mockFs.readdir).toHaveBeenCalledWith(expect.stringContaining("src/content/projects"));
    });

    it("should handle complex stack arrays", async () => {
      mockFs.readdir.mockResolvedValue(["complex.mdx"] as any);
      mockFs.readFile.mockResolvedValue(`---
title: "Complex Stack Project"
date: "2023-07-01"
summary: "Project with complex tech stack"
stack:
  - "Next.js 13"
  - "TypeScript 5.0"
  - "Tailwind CSS"
  - "Vercel"
  - "PostgreSQL"
---
Content`);

      const projects = await getAllProjects();

      expect(projects[0].stack).toEqual([
        "Next.js 13",
        "TypeScript 5.0", 
        "Tailwind CSS",
        "Vercel",
        "PostgreSQL"
      ]);
    });

    it("should handle empty string values correctly", async () => {
      mockFs.readdir.mockResolvedValue(["empty-fields.mdx"] as any);
      mockFs.readFile.mockResolvedValue(`---
title: ""
date: "2023-08-01"
summary: ""
status: ""
impact: ""
---
Content`);

      const projects = await getAllProjects();

      expect(projects[0].title).toBe("");
      expect(projects[0].summary).toBe("");
      expect(projects[0].status).toBe("");
      expect(projects[0].impact).toBe("");
    });
  });

  describe("ProjectMeta interface", () => {
    it("should match expected interface structure", () => {
      const projectMeta: ProjectMeta = {
        slug: "test-slug",
        title: "Test Title", 
        date: "2023-01-01",
        summary: "Test summary",
        status: "completed",
        stack: ["React", "TypeScript"],
        impact: "Test impact"
      };

      expect(projectMeta).toHaveProperty("slug");
      expect(projectMeta).toHaveProperty("title");
      expect(projectMeta).toHaveProperty("date");
      expect(projectMeta).toHaveProperty("summary");
      expect(projectMeta).toHaveProperty("status");
      expect(projectMeta).toHaveProperty("stack");
      expect(projectMeta).toHaveProperty("impact");
    });

    it("should allow optional fields to be undefined", () => {
      const minimalProject: ProjectMeta = {
        slug: "minimal",
        title: "Minimal",
        date: "2023-01-01",
        summary: "Summary"
      };

      expect(minimalProject.status).toBeUndefined();
      expect(minimalProject.stack).toBeUndefined();
      expect(minimalProject.impact).toBeUndefined();
    });
  });
});