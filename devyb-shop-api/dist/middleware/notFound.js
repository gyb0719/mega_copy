"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const errorHandler_1 = require("./errorHandler");
const notFound = (req, _res, next) => {
    const error = new errorHandler_1.ApiError(404, `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`);
    next(error);
};
exports.notFound = notFound;
exports.default = exports.notFound;
//# sourceMappingURL=notFound.js.map