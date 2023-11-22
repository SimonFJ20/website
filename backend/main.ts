import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

type User = {
    id: number;
    createdAt: string;
    username: string;
    passwordHash: string;
    status: "user" | "mod" | "admin";
    banned: boolean;
};

type Comment = {
    id: number;
    createdAt: string;
    replyCommentId: number | null;
    articleId: number;
    userId: number;
    message: string;
    upvotes: number;
    downvotes: number;
    deleted: boolean;
};

interface Database {
    nextUserId(): Promise<number>;
    userExists(id: number): Promise<boolean>;
    userWithUsernameExists(username: string): Promise<boolean>;
    user(id: number): Promise<User | null>;
    userWithUsername(username: string): Promise<User | null>;
    addUser(user: User): Promise<void>;
    updateUser(id: number, user: User): Promise<void>;

    nextCommentId(): Promise<number>;
    comment(id: number): Promise<Comment | null>;
    commentExists(id: number): Promise<boolean>;
    commentRepliesRecursive(id: number): Promise<Comment[] | null>;
    commentsOfArticle(articleId: number): Promise<Comment[]>;
    addComment(comment: Comment): Promise<void>;
    updateComment(id: number, comment: Comment): Promise<void>;
}

type JsonDbData = {
    ids: {
        users: number;
        comments: number;
    };
    users: User[];
    comments: Comment[];
    commentReplies: { [commentId: number]: number[] };
};

class JsonDb implements Database {
    private data!: JsonDbData;
    constructor(private readonly filename: string) {}
    async nextUserId(): Promise<number> {
        await this.load();
        const id = this.data.ids.users;
        this.data.ids.users += 1;
        await this.save();
        return id;
    }
    async userExists(id: number): Promise<boolean> {
        await this.load();
        return this.data.users.some((user) => user.id === id);
    }
    async userWithUsernameExists(username: string): Promise<boolean> {
        await this.load();
        return this.data.users.some((user) => user.username === username);
    }
    async user(id: number): Promise<User | null> {
        await this.load();
        return this.data.users.find((user) => user.id === id) ??
            null;
    }
    async userWithUsername(username: string): Promise<User | null> {
        await this.load();
        return this.data.users.find((user) => user.username === username) ??
            null;
    }
    async addUser(user: User): Promise<void> {
        await this.load();
        this.data.users.push(user);
        await this.save();
    }
    async updateUser(id: number, user: User): Promise<void> {
        await this.load();
        const i = this.data.users.findIndex((user) => user.id === id);
        if (i === -1) {
            throw new Error("could not find user");
        }
        this.data.users[i] = user;
        await this.save();
    }
    async nextCommentId(): Promise<number> {
        await this.load();
        const id = this.data.ids.comments;
        this.data.ids.comments += 1;
        await this.save();
        return id;
    }
    async comment(id: number): Promise<Comment | null> {
        await this.load();
        return this.data.comments.find((comment) => comment.id === id) ?? null;
    }
    async commentExists(id: number): Promise<boolean> {
        await this.load();
        return this.data.users.some((user) => user.id === id);
    }
    async commentRepliesRecursive(id: number): Promise<Comment[] | null> {
        await this.load();
        if (!(id in this.data.commentReplies)) {
            throw new Error("comment not in comment replies");
        }
        const maybeComments = this.data.commentReplies[id].map((replyId) =>
            this.data.comments.find((comment) => comment.id === replyId) ?? null
        );
        if (maybeComments.some((comment) => comment === null)) {
            throw new Error("reply comment not in comments");
        }
        return maybeComments.map((comment) => comment!);
    }
    async commentsOfArticle(articleId: number): Promise<Comment[]> {
        await this.load();
        return this.data.comments.filter((comment) =>
            comment.articleId === articleId
        );
    }
    async addComment(comment: Comment): Promise<void> {
        await this.load();
        if (comment.replyCommentId !== null) {
            if (!(comment.replyCommentId in this.data.commentReplies)) {
                throw new Error("reply comment not found in replies");
            }
            this.data.commentReplies[comment.replyCommentId].push(
                comment.replyCommentId,
            );
        }
        this.data.comments.push(comment);
        this.data.commentReplies[comment.id] = [];
        await this.save();
    }
    async updateComment(id: number, comment: Comment): Promise<void> {
        await this.load();
        const i = this.data.comments.findIndex((comment) => comment.id === id);
        if (i === -1) {
            throw new Error("could not find comment");
        }
        this.data.comments[i] = comment;
        await this.save();
    }
    async init() {
        try {
            await Deno.stat(this.filename);
        } catch {
            const data: JsonDbData = {
                ids: { users: 0, comments: 0 },
                users: [],
                comments: [],
                commentReplies: {},
            };
            await Deno.writeTextFile(this.filename, JSON.stringify(data));
        }
    }
    private async load() {
        this.data = JSON.parse(await Deno.readTextFile(this.filename));
    }
    private async save() {
        await Deno.writeTextFile(this.filename, JSON.stringify(this.data));
    }
}

const db = new JsonDb("db.json");

type Session = {
    id: number;
    createdAt: Date;
    token: string;
    userId: number;
    username: string;
};

function generateToken(): string {
    let token = "";
    const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    for (let i = 0; i < 32; ++i) {
        token += chars[Math.random() * chars.length];
    }
    return token;
}

class Sessions {
    private sessions: Session[] = [];
    private nextSessionId = 0;
    public purgeSessionsWithToken(token: string) {
        this.sessions = this.sessions.filter((session) =>
            session.token !== token
        );
    }
    public createSession(user: User): Session {
        this.sessions = this.sessions.filter((session) =>
            session.userId !== user.id
        );
        const session: Session = {
            id: this.nextSessionId++,
            createdAt: new Date(),
            token: generateToken(),
            userId: user.id,
            username: user.username,
        };
        this.sessions.push(session);
        return session;
    }
    public sessionWithToken(token: string): Session | null {
        return this.sessions.find((session) => session.token === token) ?? null;
    }
}

const sessions = new Sessions();

const router = new Router();

// deno-lint-ignore no-explicit-any
function req<T>(ctx: any): Promise<T> {
    const body = ctx.request.body();
    if (body.type !== "json") {
        return ctx.throw(400);
    }
    return body.value;
}

type Object = { [key: string | number | symbol]: unknown };
type Res<T, E> = { ok: true } & T | { ok: false } & E;
type RT<R> = R extends { ok: true } & infer T extends Object ? T : never;
type RE<R> = R extends { ok: false } & infer E extends Object ? E : never;

// deno-lint-ignore no-explicit-any
function resOk<R extends Res<any, any>>(ctx: any, body: RT<R>): void {
    ctx.response.status = 200;
    ctx.response.body = { ok: true, ...body };
}

// deno-lint-ignore no-explicit-any
function resError<R extends Res<any, any>>(ctx: any, body: RE<R>): void {
    ctx.response.status = 400;
    ctx.response.body = { ok: false, ...body };
}

type RegisterReq = {
    username: string;
    password: string;
};

type RegisterRes = Res<{ user: User }, { error: "username taken" }>;

router.post("/api/register", async (ctx) => {
    const { username, password } = await req<RegisterReq>(ctx);
    if (await db.userWithUsernameExists(username)) {
        return resError<RegisterRes>(ctx, { error: "username taken" });
    }
    const passwordHash = await bcrypt.hash(password);
    const user: User = {
        id: await db.nextUserId(),
        createdAt: new Date().toISOString(),
        username,
        passwordHash,
        status: "user",
        banned: false,
    };
    await db.addUser(user);
    return resOk<RegisterRes>(ctx, { user });
});

type LoginReq = {
    username: string;
    password: string;
};

type LoginRes = Res<{ session: Session }, { error: "wrong username/password" }>;

router.post("/api/login", async (ctx) => {
    const { username, password } = await req<LoginReq>(ctx);
    const maybeUser = await db.userWithUsername(username);
    if (maybeUser === null) {
        return resError<LoginRes>(ctx, { error: "wrong username/password" });
    }
    if (!await bcrypt.compare(password, maybeUser.passwordHash)) {
        return resError<LoginRes>(ctx, { error: "wrong username/password" });
    }
    const session = sessions.createSession(maybeUser);
    return resOk<LoginRes>(ctx, { session });
});

type LogoutReq = { token: string };

type LogoutRes = Res<{}, {}>;

router.post("/api/logout", async (ctx) => {
    const { token } = await req<LogoutReq>(ctx);
    sessions.purgeSessionsWithToken(token);
    return resOk<LogoutRes>(ctx, {});
});

type CommentCreateReq = {
    token: string;
    articleId: number;
    replyCommentId: number | null;
    message: string;
};

type CommentCreateRes = Res<
    { comment: Comment },
    { error: "unathorized" | "comment doesn't exist" | "server error" }
>;

router.post("/api/comment/create", async (ctx) => {
    const body = await req<CommentCreateReq>(ctx);
    const session = sessions.sessionWithToken(body.token);
    if (session === null) {
        return resError<CommentCreateRes>(ctx, { error: "unathorized" });
    }
    const user = await db.user(session.userId)!;
    if (user === null) {
        return resError<CommentCreateRes>(ctx, { error: "server error" });
    }
    if (user.banned) {
        return resError<CommentCreateRes>(ctx, { error: "unathorized" });
    }
    if (
        body.replyCommentId !== null && !db.commentExists(body.replyCommentId)
    ) {
        return resError<CommentCreateRes>(ctx, {
            error: "comment doesn't exist",
        });
    }
    const comment: Comment = {
        id: await db.nextCommentId(),
        createdAt: new Date().toISOString(),
        replyCommentId: body.articleId,
        articleId: body.articleId,
        userId: user.id,
        message: body.message,
        upvotes: 0,
        downvotes: 0,
        deleted: false,
    };
    db.addComment(comment);
    return resOk<CommentCreateRes>(ctx, { comment });
});

type CommentDeleteReq = {
    token: string;
    commentId: number;
};

type CommentDeleteRes = Res<{}, { error: "unathorized" | "server error" }>;

router.post("/api/comment/delete", async (ctx) => {
    const body = await req<CommentDeleteReq>(ctx);
    const session = sessions.sessionWithToken(body.token);
    if (session === null) {
        return resError<CommentCreateRes>(ctx, { error: "unathorized" });
    }
    const user = await db.user(session.userId)!;
    if (user === null) {
        return resError<CommentCreateRes>(ctx, { error: "server error" });
    }
    if (
        user.banned ||
        user.status !== "mod" && user.status === "admin"
    ) {
        return resError<CommentCreateRes>(ctx, { error: "unathorized" });
    }
    const comment = await db.comment(body.commentId);
    if (comment === null) {
        return resOk<CommentDeleteRes>(ctx, {});
    }
    comment.deleted = true;
    comment.message = "[redacted]";
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 8000 });

