/**
 * Decentralized FDA API
 * A platform for quantifying the effects of every drug, supplement, food, and other factor on your health.
 *
 * OpenAPI spec version: 0.0.1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { Button } from '../models/Button';
import { InputField } from '../models/InputField';


export class Card {
    'actionSheetButtons'?: Array<Button>;
    /**
    * Smaller square image
    */
    'avatar'?: string;
    /**
    * Smaller circular image
    */
    'avatarCircular'?: string;
    /**
    * Ex: #f2f2f2
    */
    'backgroundColor'?: string;
    'buttons'?: Array<Button>;
    'buttonsSecondary'?: Array<Button>;
    /**
    * Ex: Content
    */
    'content'?: string;
    /**
    * Ex: Title
    */
    'headerTitle'?: string;
    /**
    * HTML for the entire card.
    */
    'html'?: string;
    /**
    * Ex: <div>Content</div>
    */
    'htmlContent'?: string;
    /**
    * HTML element id
    */
    'id': string;
    /**
    * Larger image of variable dimensions
    */
    'image'?: string;
    'inputFields'?: Array<InputField>;
    /**
    * Ex: ion-refresh
    */
    'ionIcon'?: string;
    /**
    * A link to a web page or something. Not much more to say about that.
    */
    'link'?: string;
    /**
    * Key value pairs derived from user input fields, button clicks, or preset defaults
    */
    'parameters'?: any;
    'selectedButton'?: Button;
    /**
    * Ex: sharingBody
    */
    'sharingBody'?: string;
    'sharingButtons'?: Array<Button>;
    /**
    * Ex: sharingTitle
    */
    'sharingTitle'?: string;
    /**
    * Ex: subTitle
    */
    'subHeader'?: string;
    /**
    * Ex: subTitle
    */
    'subTitle'?: string;
    /**
    * Ex: Title
    */
    'title'?: string;

    static readonly discriminator: string | undefined = undefined;

    static readonly attributeTypeMap: Array<{name: string, baseName: string, type: string, format: string}> = [
        {
            "name": "actionSheetButtons",
            "baseName": "actionSheetButtons",
            "type": "Array<Button>",
            "format": ""
        },
        {
            "name": "avatar",
            "baseName": "avatar",
            "type": "string",
            "format": ""
        },
        {
            "name": "avatarCircular",
            "baseName": "avatarCircular",
            "type": "string",
            "format": ""
        },
        {
            "name": "backgroundColor",
            "baseName": "backgroundColor",
            "type": "string",
            "format": ""
        },
        {
            "name": "buttons",
            "baseName": "buttons",
            "type": "Array<Button>",
            "format": ""
        },
        {
            "name": "buttonsSecondary",
            "baseName": "buttonsSecondary",
            "type": "Array<Button>",
            "format": ""
        },
        {
            "name": "content",
            "baseName": "content",
            "type": "string",
            "format": ""
        },
        {
            "name": "headerTitle",
            "baseName": "headerTitle",
            "type": "string",
            "format": ""
        },
        {
            "name": "html",
            "baseName": "html",
            "type": "string",
            "format": ""
        },
        {
            "name": "htmlContent",
            "baseName": "htmlContent",
            "type": "string",
            "format": ""
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "string",
            "format": ""
        },
        {
            "name": "image",
            "baseName": "image",
            "type": "string",
            "format": ""
        },
        {
            "name": "inputFields",
            "baseName": "inputFields",
            "type": "Array<InputField>",
            "format": ""
        },
        {
            "name": "ionIcon",
            "baseName": "ionIcon",
            "type": "string",
            "format": ""
        },
        {
            "name": "link",
            "baseName": "link",
            "type": "string",
            "format": ""
        },
        {
            "name": "parameters",
            "baseName": "parameters",
            "type": "any",
            "format": ""
        },
        {
            "name": "selectedButton",
            "baseName": "selectedButton",
            "type": "Button",
            "format": ""
        },
        {
            "name": "sharingBody",
            "baseName": "sharingBody",
            "type": "string",
            "format": ""
        },
        {
            "name": "sharingButtons",
            "baseName": "sharingButtons",
            "type": "Array<Button>",
            "format": ""
        },
        {
            "name": "sharingTitle",
            "baseName": "sharingTitle",
            "type": "string",
            "format": ""
        },
        {
            "name": "subHeader",
            "baseName": "subHeader",
            "type": "string",
            "format": ""
        },
        {
            "name": "subTitle",
            "baseName": "subTitle",
            "type": "string",
            "format": ""
        },
        {
            "name": "title",
            "baseName": "title",
            "type": "string",
            "format": ""
        }    ];

    static getAttributeTypeMap() {
        return Card.attributeTypeMap;
    }

    public constructor() {
    }
}

