const documentService = require("../services/documentService");
const {
  responseOk,
  responseOkWithPagination,
} = require("../utils/apiResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const { HTTP_STATUS } = require("../constants");

class DocumentController {
  uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const document = await documentService.uploadDocument(
      req.user.id,
      req.body,
      req.file
    );

    return responseOk(
      res,
      document,
      "Document uploaded successfully",
      HTTP_STATUS.CREATED
    );
  });

  getDocuments = asyncHandler(async (req, res) => {
    const { documents, pagination } = await documentService.getDocuments(
      req.query
    );
    return responseOkWithPagination(
      res,
      documents,
      pagination,
      "Documents retrieved successfully"
    );
  });

  getMyDocuments = asyncHandler(async (req, res) => {
    const { documents, pagination } = await documentService.getMyDocuments(
      req.user.id,
      req.query
    );
    return responseOkWithPagination(
      res,
      documents,
      pagination,
      "My documents retrieved successfully"
    );
  });

  getSavedDocuments = asyncHandler(async (req, res) => {
    const { documents, pagination } = await documentService.getSavedDocuments(
      req.user.id,
      req.query
    );
    return responseOkWithPagination(
      res,
      documents,
      pagination,
      "Saved documents retrieved successfully"
    );
  });

  getDocumentById = asyncHandler(async (req, res) => {
    const document = await documentService.getDocumentById(req.params.id);
    return responseOk(res, document, "Document retrieved successfully");
  });

  deleteDocument = asyncHandler(async (req, res) => {
    await documentService.deleteDocument(req.params.id, req.user.id);
    return responseOk(res, null, "Document deleted successfully");
  });

  saveDocument = asyncHandler(async (req, res) => {
    const saved = await documentService.saveDocument(
      req.params.id,
      req.user.id
    );
    return responseOk(res, saved, "Document saved successfully");
  });

  unsaveDocument = asyncHandler(async (req, res) => {
    await documentService.unsaveDocument(req.params.id, req.user.id);
    return responseOk(res, null, "Document unsaved successfully");
  });
}

module.exports = new DocumentController();
