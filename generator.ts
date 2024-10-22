import * as markdown from "https://raw.githubusercontent.com/ubersl0th/markdown/master/mod.ts";

const articleTemplate = await Deno.readTextFile("templates/article.html");
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
    childNodes: IndexNode[];
};
const indexRoot: IndexNode = {
    type: "branch",
    childNodes: [],
    id: "index",
    title: "index",
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
    const file = articleTemplate
        .replaceAll("$title", title)
        .replaceAll("$description", description)
        .replaceAll("$main", content);
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
                };
                prev.childNodes.push(node);
                return node;
            }
            return findResult;
        }, indexRoot);
    if (indexNode.type === "leaf") {
        throw new Error("file/folder mismatch");
    }
    indexNode.childNodes.push({
        id: filePath.split("/").at(-1)!,
        type: "leaf",
        filePath,
        title,
    });
    await Deno.mkdir("build/" + folderPath, { recursive: true });
    await Deno.writeTextFile("build/" + ensureHtmlFileEnding(filePath), file);
}

function generateArticleIndex(node: IndexNode, depth = 2): string {
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
