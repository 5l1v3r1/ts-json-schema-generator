import * as ts from "typescript";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { EnumType, EnumValue } from "../Type/EnumType";
import { NodeParser, Context } from "../NodeParser";

export class TypeofNodeParser implements SubNodeParser {
    public constructor(
        private typeChecker: ts.TypeChecker,
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.TypeQueryNode): boolean {
        return node.kind === ts.SyntaxKind.TypeQuery;
    }

    public createType(node: ts.TypeQueryNode, context: Context): BaseType {
        const symbol: ts.Symbol = this.typeChecker.getSymbolAtLocation(node.exprName);

        return this.childNodeParser.createType((<any>symbol.valueDeclaration).type, context);
    }
}
