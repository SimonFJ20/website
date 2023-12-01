const articleTemplate = await Deno.readTextFile("templates/article.html");
const indexTemplate = await Deno.readTextFile("templates/article_index.html");

type IndexNode = {
    type: "leaf";
    filePath: string;
    title: string;
} | {
    type: "branch";
    title: string;
    childNodes: { [key: string]: IndexNode };
};
const indexRoot: IndexNode = { type: "branch", childNodes: {}, title: "index" };

for (const filePath of Deno.args) {
    console.log(`Generating ${filePath}`);
    const content = await Deno.readTextFile(filePath);
    const titleMatch = content.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : filePath;
    const file = articleTemplate
        .replaceAll("$title", title)
        .replaceAll("$main", content);
    const folderPath = filePath.slice(0, filePath.lastIndexOf("/"));
    const indexNode = folderPath.split("/").reduce<IndexNode>((prev, curr) => {
        if (prev.type === "leaf") {
            throw new Error("file/folder mismatch");
        }
        if (!(curr in prev.childNodes)) {
            prev.childNodes[curr] = {
                type: "branch",
                childNodes: {},
                title: curr[0].toUpperCase() + curr.slice(1),
            };
        }
        return prev.childNodes[curr];
    }, indexRoot);
    if (indexNode.type === "leaf") {
        throw new Error("file/folder mismatch");
    }
    indexNode.childNodes[filePath.split("/").at(-1)!] = {
        type: "leaf",
        filePath,
        title,
    };
    await Deno.mkdir("build/" + folderPath, { recursive: true });
    await Deno.writeTextFile("build/" + filePath, file);
}

function generateIndex(node: IndexNode): string {
    if (node.type === "leaf") {
        return `<li><a href="/${node.filePath}">${node.title}</a></li>`;
    }
    const elements: string[] = [];
    for (const childNode in node.childNodes) {
        elements.push(generateIndex(node.childNodes[childNode]));
    }
    return `<li>${node.title[0].toUpperCase() + node.title.slice(1)}<ul>${
        elements.join("\n")
    }</ul></li>`;
}

const indexContent = indexTemplate.replaceAll(
    "$main",
    generateIndex(indexRoot),
);
console.log(indexContent);
await Deno.writeTextFile("build/articles/index.html", indexContent);
