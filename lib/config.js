"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const core = __importStar(require("@actions/core"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const path_1 = __importDefault(require("path"));
const ConfigEntry_1 = require("./ConfigEntry");
const CONFIG_PATH = '.github';
function getConfig(github, fileName, context) {
    return __awaiter(this, void 0, void 0, function* () {
        core.debug(`getConfig ${fileName}`);
        try {
            const configFile = {
                owner: context.repo.owner,
                repo: context.repo.repo,
                path: path_1.default.posix.join(CONFIG_PATH, fileName),
                ref: context.payload.pull_request.head.sha,
            };
            core.debug(`Getting contents of ${JSON.stringify(configFile)}`);
            const response = yield github.repos.getContents(configFile);
            if (Array.isArray(response.data)) {
                throw new Error(`${fileName} is not a file.`);
            }
            if (response.data.content === undefined) {
                throw new Error(`${fileName} is empty.`);
            }
            return parseConfig(response.data.content);
        }
        catch (error) {
            core.debug(`getConfig error: ${error.toString()}`);
            if (error.status === 404) {
                return [];
            }
            throw error;
        }
    });
}
exports.getConfig = getConfig;
function parseConfig(content) {
    var _a;
    core.debug(`parseConfig ${content}`);
    const configObject = ((_a = js_yaml_1.default.load(Buffer.from(content, 'base64').toString())) !== null && _a !== void 0 ? _a : {});
    if (configObject === {}) {
        return [];
    }
    core.debug(`configObject: ${JSON.stringify(configObject)}`);
    return Object.entries(configObject).reduce((entries, [label, object]) => {
        const headPattern = object.head || (typeof object === 'string' || Array.isArray(object) ? object : undefined);
        const basePattern = object.base;
        let headRegExp;
        let baseRegExp;
        try {
            headRegExp = extractRegExp(object.headRegExp);
            baseRegExp = extractRegExp(object.baseRegExp);
        }
        catch (_a) {
            throw new Error('config.yml has invalid structure.');
        }
        if (headPattern || basePattern || headRegExp || baseRegExp) {
            entries.push(new ConfigEntry_1.ConfigEntry({
                label: label,
                head: headPattern,
                headRegExp: headRegExp,
                base: basePattern,
                baseRegExp: baseRegExp,
            }));
        }
        else {
            throw new Error('config.yml has invalid structure.');
        }
        return entries;
    }, []);
}
function extractRegExp(regExpString) {
    if (!regExpString)
        return undefined;
    return Array.isArray(regExpString)
        ? regExpString.map(x => new RegExp(x.replace('//', '/')))
        : new RegExp(regExpString.replace('//', '/'));
}
