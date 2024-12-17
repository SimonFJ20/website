import * as markdown from "https://raw.githubusercontent.com/ubersl0th/markdown/master/mod.ts";

const articleTemplate = await Deno.readTextFile("templates/article.html");
const compilerArticleTemplate = await Deno.readTextFile(
    "templates/compiler_article.html",
);
const indexTemplate = await Deno.readTextFile("templates/index.html");
const rssTemplate = await Deno.readTextFile("templates/rss.xml");

type IndexNode = {
    type: "leaf";
    filePath: string;
    id: string;
    title: string;
} | {
    type: "branch";
    id: string;
    title: string;
    filePath: string;
    childNodes: IndexNode[];
    indexFileExists?: boolean;
};
const indexRoot: IndexNode = {
    type: "branch",
    childNodes: [],
    id: "index",
    title: "index",
    filePath: "articles",
};

async function readContent(filePath: string): Promise<string> {
    const text = await Deno.readTextFile(filePath);
    if (filePath.endsWith(".md")) {
        return markdown.Marked.parse(text).content;
    }
    return text;
}

function ensureHtmlFileEnding(filePath: string): string {
    if (!filePath.endsWith(".html")) {
        return filePath.replace(/\.md$/, "") + ".html";
    }
    return filePath;
}

async function fileExists(path: string): Promise<boolean> {
    return await Deno.lstat(path)
        .then((_fileInfo) => true)
        .catch((_error) => false);
}

function generateArticleFile(
    title: string,
    content: string,
    description: string,
    filePath: string,
): string {
    if (filePath.startsWith("articles/courses/compiler/")) {
        return compilerArticleTemplate
            .replaceAll("$title", title)
            .replaceAll("$description", description)
            .replaceAll("$main", content);
    }
    return articleTemplate
        .replaceAll("$title", title)
        .replaceAll("$description", description)
        .replaceAll("$main", content);
}

for (const filePath of Deno.args) {
    console.log(`Generating ${filePath}`);
    const content = await readContent(filePath);
    const titleMatch = content.match(/<h1.*?>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : filePath;
    const descriptionMatch = content.match(
        /<p.*?>(?:<strong>)?(.*?)(:?<\/strong>)?<\/p>/,
    );
    const description = descriptionMatch
        ? descriptionMatch[1]
        : content.slice(100);
    const file = generateArticleFile(title, content, description, filePath);
    const folderPath = filePath.slice(0, filePath.lastIndexOf("/"));
    const indexNode = folderPath
        .split("/")
        .slice(1)
        .reduce<IndexNode>((prev, curr) => {
            if (prev.type === "leaf") {
                throw new Error("file/folder mismatch");
            }
            const findResult = prev.childNodes.find((node) => node.id === curr);
            if (findResult === undefined) {
                const node: IndexNode = {
                    type: "branch",
                    childNodes: [],
                    id: curr,
                    title: curr[0].toUpperCase() + curr.slice(1),
                    filePath: `${prev.filePath}/${curr}`,
                };
                prev.childNodes.push(node);
                return node;
            }
            return findResult;
        }, indexRoot);
    if (indexNode.type === "leaf") {
        throw new Error("file/folder mismatch");
    }
    const id = filePath.split("/").at(-1)!;
    if (!id.startsWith("_")) {
        indexNode.childNodes.push({
            id,
            type: "leaf",
            filePath,
            title,
        });
    }
    await Deno.mkdir("build/" + folderPath, { recursive: true });
    await Deno.writeTextFile("build/" + ensureHtmlFileEnding(filePath), file);
}

async function populateBranchNodesWithIndexPages(
    node: IndexNode,
): Promise<void> {
    if (node.type === "leaf") {
        return;
    }
    const path = `public/${node.filePath}/index.html`;
    if (await fileExists(path)) {
        const content = await Deno.readTextFile(path);
        const match = content.match(/<h1>(.*?)<\/h1>/);
        const title = match !== null ? match[1] : node.title;
        node.indexFileExists = true;
        node.title = title;
    }
    await Promise.all(
        node.childNodes.map((node) => populateBranchNodesWithIndexPages(node)),
    );
}

await populateBranchNodesWithIndexPages(indexRoot);

function generateArticleIndex(node: IndexNode, depth = 2): string {
    if (
        node.id.startsWith("_") ||
        (node.type === "branch" && node.childNodes.length === 0)
    ) {
        console.log(`Skipping ${node.filePath}`);
        return "";
    }
    const indent = "    ".repeat(depth);
    if (node.type === "leaf") {
        return `${indent}<li><a href="/${
            ensureHtmlFileEnding(node.filePath)
        }">${node.title}</a></li>`;
    }
    const childNodes = [
        ...node.childNodes.filter((node) => !/^\d+/.test(node.title))
            .toSorted(),
        ...node.childNodes.filter((node) => /^\d+/.test(node.title)).sort((
            a,
            b,
        ) => parseInt(a.title) - parseInt(b.title)),
    ];
    const elements: string[] = [];
    for (const childNode of childNodes) {
        elements.push(generateArticleIndex(childNode, depth + 1));
    }
    if (node.indexFileExists) {
        return `${indent}<li><a href="${node.filePath}/index.html">${
            node.title[0].toUpperCase() + node.title.slice(1)
        }</a><ul>\n${elements.join("\n")}\n${indent}</ul></li>`;
    }
    return `${indent}<li>${
        node.title[0].toUpperCase() + node.title.slice(1)
    }<ul>\n${elements.join("\n")}\n${indent}</ul></li>`;
}

function generateRSS(node: IndexNode): string {
    if (node.type === "leaf") {
        return `
            <item>
                <title>${
            node.title[0].toUpperCase() + node.title.slice(1)
        }</title>
                <link>http://simonfj20.dk/${
            ensureHtmlFileEnding(node.filePath)
        }</link>
                <description>${
            node.title[0].toUpperCase() + node.title.slice(1)
        }</description>
            </item>
        `;
    }
    return node.childNodes.map((node) => generateRSS(node)).join("");
}

console.log("Generating index.html");
const indexContent = indexTemplate.replaceAll(
    "$article_index",
    `<ul>\n${
        indexRoot.childNodes.map((node) => generateArticleIndex(node)).join(
            "\n",
        )
    }\n        </ul>`,
);
await Deno.writeTextFile("build/index.html", indexContent);

console.log("Generating rss.xml");
const rssContent = rssTemplate.replaceAll(
    "$items",
    indexRoot.childNodes.map((node) => generateRSS(node)).join(""),
);
await Deno.writeTextFile("build/rss.xml", rssContent);
