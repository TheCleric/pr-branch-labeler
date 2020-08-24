import * as core from "@actions/core";
import { readFileSync } from "fs";
import "jest-extended";

// Dump core debug/error to console debug so that --silent works
jest.spyOn(core, 'debug').mockImplementation(console.debug);
jest.spyOn(core, 'error').mockImplementation(console.debug);

function encodeContent(content: Buffer | ArrayBuffer | SharedArrayBuffer) {
    return Buffer.from(content).toString("base64");
}

export function configFixture(fileName = "config.yml") {
    return {
        type: "file",
        encoding: "base64",
        name: fileName,
        path: `.github/${fileName}`,
        content: encodeContent(readFileSync(`./__tests__/fixtures/${fileName}`))
    };
}

export function emptyConfigFixture(fileName = "config.yml") {
    return {
        type: "file",
        encoding: "base64",
        name: fileName,
        path: `.github/${fileName}`,
        content: undefined
    };
}
