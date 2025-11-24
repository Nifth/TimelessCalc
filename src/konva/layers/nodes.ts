import type { Node } from "$lib/types";
import { createSprite } from "../utils/sprites";
import { TREE_CONSTANTS } from "$lib/constants/tree";
import { canvas } from "$lib/konva/canvasContext";

export function drawNodes()
{
    const layer = canvas.mainLayer!,
        data = canvas.treeData,
        jewelSocketImages = canvas.jewelImages;
    Object.entries(data.nodes).forEach(([_, node]: [string, Node]) => {
        if (!node || !node.group) return;

        const nodeX = node.x;
        const nodeY = node.y;

        // node sprite
        if (node.classStartIndex !== undefined) {
            const img = createSprite(
                TREE_CONSTANTS.SPRITES.START_NODE,
                TREE_CONSTANTS.SPRITES.START_BACKGROUND,
                nodeX,
                nodeY
            );
            layer.add(img);
            return;
        } else {
            if (node.isJewelSocket) {
                if (node.expansionJewel?.parent) return;
                let jewelType = node.expansionJewel ? TREE_CONSTANTS.SPRITES.CLUSTER_UNALLOCATED : TREE_CONSTANTS.SPRITES.JEWEL_FRAME_UNALLOCATED;
                const image = createSprite(
                    TREE_CONSTANTS.SPRITES.FRAME,
                    jewelType,
                    nodeX,
                    nodeY,
                )

                jewelSocketImages.set(node.skill, image);

                layer.add(image)
            } else {
                // todo: mettre dans store aussi, sauf mastery, si possible filtrer pour ne mettre que les nodes qui peuvent être changés dans le store
                const key = node.isMastery ? (node.inactiveIcon ? TREE_CONSTANTS.SPRITES.MASTERY_INACTIVE : TREE_CONSTANTS.SPRITES.MASTERY) :
                            node.isKeystone ? TREE_CONSTANTS.SPRITES.KEYSTONE_INACTIVE :
                            node.isNotable ? TREE_CONSTANTS.SPRITES.NOTABLE_INACTIVE : TREE_CONSTANTS.SPRITES.NORMAL_INACTIVE;
                const icon = createSprite(key, node.inactiveIcon || node.icon || TREE_CONSTANTS.SPRITES.DEFAULT_ICON, nodeX, nodeY);
                layer.add(icon);

                if (!node.isMastery && !node.isJewelSocket) {
                    const frame = createSprite(
                        TREE_CONSTANTS.SPRITES.FRAME,
                        node.isKeystone ? TREE_CONSTANTS.SPRITES.KEYSTONE_FRAME_UNALLOCATED :
                            node.isNotable ? TREE_CONSTANTS.SPRITES.NOTABLE_FRAME_UNALLOCATED : TREE_CONSTANTS.SPRITES.DEFAULT_FRAME,
                        nodeX,
                        nodeY
                    );
                    layer.add(frame);
                    canvas.nodeImages.set(node.skill, {icon: icon, frame: frame});
                }
            }
        }
    });
}

export function drawBaseRadius()
{
    const layer = canvas.mainLayer!,
        jewelRadiusImages = canvas.jewelRadiusImages;
    const jewelRadius = TREE_CONSTANTS.SOCKET.RADIUS;
    const defaultRadius = createSprite(
        TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
        TREE_CONSTANTS.SOCKET.RADIUS_SPRITES.default.default,
        0,
        0
    );
    const defaultRadius2 = createSprite(
        TREE_CONSTANTS.SPRITES.JEWEL_RADIUS,
        TREE_CONSTANTS.SOCKET.RADIUS_SPRITES.default.inverse,
        0,
        0
    );
    defaultRadius.visible(false);
    defaultRadius2.visible(false);
    defaultRadius.opacity(0.5);
    defaultRadius2.opacity(0.5);
    let ratio = defaultRadius.width() / 2;
    defaultRadius.scaleX(jewelRadius / ratio);
    defaultRadius.scaleY(jewelRadius / ratio);
    defaultRadius2.scaleX(jewelRadius / ratio);
    defaultRadius2.scaleY(jewelRadius / ratio);

    jewelRadiusImages.set(TREE_CONSTANTS.SOCKET.DEFAULT, {a: defaultRadius, b: defaultRadius2});
    layer.add(defaultRadius);
    layer.add(defaultRadius2);
}