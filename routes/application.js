const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/application");

router.get("/get-application/:email", applicationController.getApplications);
router.post("/save-field", applicationController.createApplication);

module.exports = router;
