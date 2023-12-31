import { AWORMap } from "../../lib/crdts/AWORMap";
import { CCounter } from "../../lib/crdts/CCounter";
import { DotContext } from "../../lib/crdts/DotContext";
import { EWFlag } from "../../lib/crdts/EWFlag";
import { MultiItem, SingleItem } from "./Item";

type ListItem = SingleItem | MultiItem;
type itemType = "single" | "multi";

class ShoppingList {
    private uuid: string;
    private dots: DotContext<string>;
    private items: AWORMap<string, ListItem, string>;
    private listName: string;

    constructor(
        id: string,
        listName: string,
        items: AWORMap<string, ListItem, string>,
        dots: DotContext<string>
    ) {
        this.uuid = id;
        this.listName = listName;
        this.items = items;
        this.dots = dots;
    }

    get id(): string {
        return this.uuid;
    }

    get name(): string {
        return this.listName;
    }

    get itemList(): AWORMap<string, ListItem, string> {
        return this.items;
    }

    getItem(id: string): ListItem | null {
        const item = this.items.get(id);
        return item ?? null;
    }

    static createEmptyList(id: string, listName: string): ShoppingList {
        const dots = new DotContext<string>();
        const items = new AWORMap<string, ListItem, string>(
            id,
            undefined,
            undefined,
            dots
        );

        return new ShoppingList(id, listName, items, dots);
    }

    addItem(id: string, type: itemType = "single"): ShoppingList {
        const item: ListItem =
            type === "single"
                ? SingleItem.createItem(id)
                : MultiItem.createItem(id);
        this.items.set(id, item);
        console.log("dots on add", this.dots.toJSON())
        return this;
    }

    addItemObj(item: ListItem): ShoppingList {
        const id = item.id;
        if (!this.items.values.has(id)) {
            this.items.set(id, item);
        }

        return this;
    }

    removeItem(id: string): ShoppingList {
        this.items.remove(id);
        return this;
    }

    merge(list: ShoppingList, deep = true): ShoppingList {
        if (!list) return this;

        this.items.merge(list.items, deep);

        if (deep) this.dots.merge(list.dots);

        return this;
    }

    toJSON(): {
        uuid: string;
        name: string;
        items: ReturnType<AWORMap<string, ListItem, string>["toJSON"]>;
        dots: ReturnType<DotContext<string>["toJSON"]>;
    } {
        console.log("dots on toJSON", this.dots.toJSON())
        return {
            uuid: this.uuid,
            name: this.listName,
            items: this.items.toJSON(),
            dots: this.dots.toJSON(),
        };
    }

    static fromJSON(json: ReturnType<ShoppingList["toJSON"]>, userId: string) {
        const uuid = json.uuid;
        const listName = json.name;
        console.log("dots on fromJSON", json.dots)
        const dots: DotContext<string> = new DotContext(new Map(Object.entries(json.dots)));
        const items: AWORMap<string, ListItem, string> = new AWORMap<
            string,
            ListItem,
            string
        >(
            userId,
            new Set(json.items.set),
            json.items.map.map(([id, item]) => [
                id,
                item.type === "multi"
                    ? new MultiItem(
                          id,
                          new CCounter(userId, new Set(item.toBuy.awset), dots),
                          new CCounter(userId, new Set(item.bought.awset), dots)
                      )
                    : new SingleItem(
                          id,
                          new EWFlag(userId, new Set(item.bought.awset), dots)
                      ),
            ]),
            dots
        );

        return new ShoppingList(uuid, listName, items, dots);
    }
}

export { ShoppingList };
