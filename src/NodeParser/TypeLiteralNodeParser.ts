import * as ts from "typescript";
import { NodeParser, Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { NameParser } from "../NameParser";
import { BaseType } from "../Type/BaseType";
import { ObjectType, ObjectProperty } from "../Type/ObjectType";

export class TypeLiteralNodeParser implements SubNodeParser {
    public constructor(
        private childNodeParser: NodeParser,
        private nameParser: NameParser,
    ) {
    }

    public supportsNode(node: ts.TypeLiteralNode): boolean {
        return node.kind === ts.SyntaxKind.TypeLiteral;
    }
    public createType(node: ts.TypeLiteralNode, context: Context): BaseType {
        return new ObjectType(
            this.nameParser.getTypeId(node, context),
            [],
            this.getProperties(node, context),
            this.getAdditionalProperties(node, context),
        );
    }

    private getProperties(node: ts.TypeLiteralNode, context: Context): ObjectProperty[] {
        return node.members
            .filter((property: ts.TypeElement) => property.kind === ts.SyntaxKind.PropertySignature)
            .reduce((result: ObjectProperty[], propertyNode: ts.PropertySignature) => {
                const propertySymbol: ts.Symbol = (propertyNode as any).symbol;
                const objectProperty: ObjectProperty = new ObjectProperty(
                    propertySymbol.getName(),
                    this.childNodeParser.createType(propertyNode.type, context),
                    !propertyNode.questionToken,
                );

                result.push(objectProperty);
                return result;
            }, []);
    }
    private getAdditionalProperties(node: ts.TypeLiteralNode, context: Context): BaseType|boolean {
        const properties: ts.TypeElement[] = node.members
            .filter((property: ts.TypeElement) => property.kind === ts.SyntaxKind.IndexSignature);
        if (!properties.length) {
            return false;
        }

        const signature: ts.IndexSignatureDeclaration = properties[0] as ts.IndexSignatureDeclaration;
        return this.childNodeParser.createType(signature.type, context);
    }
}
