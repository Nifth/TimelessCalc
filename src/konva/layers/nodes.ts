import type { TreeData } from "$lib/types";
import type Konva from "konva";
import type { Node } from "$lib/types";
import { createSprite } from "../utils/sprites";

export function drawNodes(layer: Konva.Layer, data: TreeData, jewelSocketImages: Map<number, Konva.Image>)
{
    Object.entries(data.nodes).forEach(([_, node]: [string, Node]) => {
        if (!node || !node.group) return;

        const nodeX = node.x;
        const nodeY = node.y;

        // node sprite
        if (node.classStartIndex !== undefined) {
            const img = createSprite('startNode', 'PSStartNodeBackgroundInactive', nodeX, nodeY);
            layer.add(img);
            return;
        } else {
            if (node.isJewelSocket) {
                if (node.expansionJewel?.parent) return;
                let jewelType = 'JewelFrameUnallocated';
                if (node.expansionJewel) {
                    jewelType = 'JewelSocketAltNormal';
                }
                const image = createSprite(
                    'frame',
                    jewelType,
                    nodeX,
                    nodeY,
                )

                jewelSocketImages.set(node.skill, image);

                layer.add(image)
            } else {
                // todo: mettre dans store aussi, sauf mastery, si possible filtrer pour ne mettre que les nodes qui peuvent être changés dans le store
                const key = node.isMastery ? (node.inactiveIcon ? 'masteryInactive' : 'mastery') :
                            node.isKeystone ? 'keystoneInactive' :
                            node.isNotable ? 'notableInactive' : 'normalInactive';
                const icon = createSprite(key, node.inactiveIcon || node.icon || 'DefaultInactive', nodeX, nodeY);
                layer.add(icon);

                if (!node.isMastery && !node.isJewelSocket) {
                    const frame = createSprite('frame',
                        node.isKeystone ? 'KeystoneFrameUnallocated' :
                        node.isNotable ? 'NotableFrameUnallocated' : 'PSSkillFrame',
                        nodeX, nodeY);
                    layer.add(frame);
                }
            }
        }
    });
}

export function drawBaseRadius(layer: Konva.Layer, jewelRadiusImages: Map<string, {a: Konva.Image, b: Konva.Image}>)
{
    const jewelRadius = 1800;
    const defaultRadius = createSprite('jewelRadius', 'JewelCircle1', 0, 0);
    const defaultRadius2 = createSprite('jewelRadius', 'JewelCircle1Inverse', 0, 0);
    defaultRadius.visible(false);
    defaultRadius2.visible(false);
    defaultRadius.opacity(0.5);
    defaultRadius2.opacity(0.5);
    let ratio = defaultRadius.width() / 2;
    defaultRadius.scaleX(jewelRadius / ratio);
    defaultRadius.scaleY(jewelRadius / ratio);
    defaultRadius2.scaleX(jewelRadius / ratio);
    defaultRadius2.scaleY(jewelRadius / ratio);
    jewelRadiusImages.set('default', {a: defaultRadius, b: defaultRadius2});
    layer.add(defaultRadius);
    layer.add(defaultRadius2);
}