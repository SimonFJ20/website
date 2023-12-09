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

for (const filePath of Deno.args) {
    console.log(`Generating ${filePath}`);
    const content = await Deno.readTextFile(filePath);
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : filePath;
    const file = articleTemplate
        .replaceAll("$title", title)
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
    await Deno.writeTextFile("build/" + filePath, file);
}

function generateArticleIndex(node: IndexNode): string {
    if (node.type === "leaf") {
        return `<li><a href="/${node.filePath}">${node.title}</a></li>`;
    }
    const elements: string[] = [];
    for (const childNode of node.childNodes) {
        elements.push(generateArticleIndex(childNode));
    }
    return `<li>${node.title[0].toUpperCase() + node.title.slice(1)}<ul>${
        elements.join("\n")
    }</ul></li>`;
}

function generateRSS(node: IndexNode): string {
    if (node.type === "leaf") {
        return `
            <item>
                <title>${
            node.title[0].toUpperCase() + node.title.slice(1)
        }</title>
                <link>/${node.filePath}</link>
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
    `<ul>${
        indexRoot.childNodes.map((node) => generateArticleIndex(node)).join("")
    }</ul>`,
);
await Deno.writeTextFile("build/index.html", indexContent);

console.log("Generating rss.xml");
const rssContent = rssTemplate.replaceAll(
    "$items",
    indexRoot.childNodes.map((node) => generateRSS(node)).join(""),
);
await Deno.writeTextFile("build/rss.xml", rssContent);
