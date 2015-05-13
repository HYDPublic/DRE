'use strict';

angular.module('phrPrototypeApp').controller('RecordCtrl', function ($scope, $window, $location, $modal, $anchorScroll, $route, format, matches, merges, history, dataservice, medapi, npiapi, medications) {

    console.log("RECORD CONTROLLER LOAD ");

    $scope.$on('modal.hide', function () {
        $scope.medReset();
    });

    $scope.entryStep = 0;
    $scope.prescriberSearchActive = false;
    $scope.drugSearchActive = false;
    $scope.dashMetrics = {};
    $scope.pDrugName = "";
    $scope.tabs = [{
        "title": "Weight",
        "data": {},
        "chartName": "d3template"
    }, {
        "title": "Blood Pressure",
        "data": {},
        "chartName": "d3template"
    }];
    $scope.$watch('tabs.activeTab', function (newVal, oldVal) {
        console.log('TAB CHANGE');
        if (newVal !== oldVal) {
            $scope.$broadcast('tabchange', {
                "val": newVal
            });
        }
    });
    $scope.tabs.activeTab = 0;

    angular.element("#nav" + $scope.entryType).removeClass("active");
    if (!dataservice.curr_section) {
        $scope.entryType = "all";
        dataservice.curr_section = $scope.entryType;
    } else {
        $scope.entryType = dataservice.curr_section;
    }
    angular.element("#nav" + $scope.entryType).addClass("active");

    // TODO make these more descriptive

    $scope.saveMedication = saveMedication;
    $scope.enteredMedication = {};
    $scope.saveMedicationStatus = null;

    // Medication images
    $scope.imgservice = function imgservice(rxcui) {
        medapi.findImages(rxcui, function (err, data) {
            $scope.medImages = data;
        });
    };

    // FDA adverse events
    $scope.fdaservice = function fdaservice(rxcui, medname) {
        if (angular.isDefined(rxcui)) {
            medapi.fdaCode(rxcui, function (err, data) {
                $scope.fdaInfo = data;
                $scope.fdatotal($scope.fdaInfo.results);
            });
        } else {
            if (angular.isDefined(medname)) {
                medapi.fdaName(medname, function (err, data) {
                    $scope.fdaInfo = data;
                    $scope.fdatotal($scope.fdaInfo.results);
                });
            }
        }
    };

    $scope.fdatotal = function fdatotal(eventsArray) {
        $scope.totalReports = _.sum(_.pluck(eventsArray, 'count'));
        _.forEach(eventsArray, function (event) {
            event.count = (100 * event.count / $scope.totalReports);
        });
    };

    // Medline Plus Connect link
    $scope.medlineservice = function medlineservice(rxcui, medname) {
        medapi.findmedline(rxcui, medname, function (err, data) {
            $scope.medline = data;
        });
    };

    $scope.previousStep = function previousStep() {
        if ($scope.entryStep === 3 && $scope.medSearchType !== 'prescription') {
            $scope.entryStep = 1;
        } else {
            $scope.entryStep--;
        }
    };

    function enteredObject() {
        console.log("entering object...");
        if ($scope.medSearchType === 'prescription') {
            console.log("...was a prescription");
            $scope.enteredMedication = {
                //"identifiers": [],
                "metadata": {
                    image: $scope.selectedImage
                },
                "sig": $scope.selectedDrug.name,
                "status": "Completed",
                //"is_brand": true,
                "administration": {
                    "dose": $scope.pDose,
                    "form": $scope.pAdminister,
                    "rate": $scope.pOften,
                    //"route": "",
                    //"dose_restriction": "",
                    //"site": "",
                    /*"interval": {
                        "xsiType": "",
                        "phase": "",
                        "period": "",
                        "frequency": true,
                        "alignment": "",
                        "event": "",
                        "event_offset": {
                            "low": "",
                            "high": "",
                            "center": "",
                            "width": ""
                        }
                    }*/
                },
                /*"precondition": {
                    "code": "",
                    "value": ""
                },*/
                "product": {
                    "identifiers": [{
                        rxcui: $scope.selectedDrug.rxcui
                    }],
                    "product": {
                        'name': $scope.selectedDrug.synonym
                    },
                    "unencoded_name": $scope.selectedDrug.name //,
                        //"manufacturer": 
                },
                "supply": {
                    //"date_time": "",
                    //"repeatNumber": "",
                    //"quantity": "",
                    "author": {
                        "identifiers": [{
                            npi: $scope.selectedPrescriber.npi
                        }],
                        //"date_time": "",
                        "name": $scope.selectedPrescriber.first_name + " " + $scope.selectedPrescriber.last_name,
                        "npi": $scope.selectedPrescriber.npi,
                        //"organization": ""
                    }
                },
                /*"indication": {
                    "identifiers": [],
                    "code": "",
                    "date_time": "",
                    "value": ""
                },*/
                "performer": $scope.selectedPrescriber.first_name + " " + $scope.selectedPrescriber.last_name //,
                    //"drug_vehicle": "",
                    /*
                    "dispense": {
                        "identifiers": [],
                        "performer": ""
                    }*/
            };
        } else {
            $scope.enteredMedication = {
                //"identifiers": [],
                "metadata": {
                    image: $scope.selectedImage
                },
                "sig": $scope.selectedDrug.name,
                "status": "Completed",
                //"is_brand": true,
                "administration": {
                    "dose": $scope.pDose,
                    "form": $scope.pAdminister,
                    "rate": $scope.pOften,
                    //"route": "",
                    //"dose_restriction": "",
                    //"site": "",
                    /*"interval": {
                        "xsiType": "",
                        "phase": "",
                        "period": "",
                        "frequency": true,
                        "alignment": "",
                        "event": "",
                        "event_offset": {
                            "low": "",
                            "high": "",
                            "center": "",
                            "width": ""
                        }
                    }*/
                },
                /*"precondition": {
                    "code": "",
                    "value": ""
                },*/
                "product": {
                    "identifiers": [{
                        rxcui: $scope.selectedDrug.rxcui
                    }],
                    "product": {
                        'name': $scope.selectedDrug.synonym
                    },
                    "unencoded_name": $scope.selectedDrug.name //,
                        //"manufacturer": 
                },
                "supply": {
                    //"date_time": "",
                    //"repeatNumber": "",
                    //"quantity": "",
                    "author": {
                        "identifiers": [{
                            npi: ""
                        }],
                        //"date_time": "",
                        "name": "",
                        "npi": "",
                        //"organization": ""
                    }
                },
                /*"indication": {
                    "identifiers": [],
                    "code": "",
                    "date_time": "",
                    "value": ""
                },*/
                "performer": "" //,
                    //"drug_vehicle": "",
                    /*
                    "dispense": {
                        "identifiers": [],
                        "performer": ""
                    }*/
            };
        }
        console.log("...entered Medication: " + $scope.enteredMedication);
    }

    $scope.nextStep = function nextStep() {
        switch ($scope.entryStep) {
        case 1:
            if (!$scope.selectedDrug) {
                $scope.drugError = "You must select a drug";
            } else {
                if ($scope.medSearchType === 'prescription') {
                    $scope.entryStep = 2;
                } else {
                    $scope.entryStep = 3;
                }
                medapi.findImages($scope.selectedDrug.rxcui, function (err, imageData) {
                    if (err) {
                        console.log("Err: " + err);
                    } else {
                        $scope.rximageResults = imageData;
                    }
                });
            }
            break;
        case 2:
            if (!$scope.selectedPrescriber) {
                $scope.prescriberError = "You must select a prescriber";
            } else {
                $scope.entryStep = 3;
            }
            break;
        case 3:
            enteredObject();
            $scope.entryStep = 4;
            break;
        default:
            break;
        }
    };

    function saveMedication() {
        medications.addMedication($scope.enteredMedication, function (err, results) {
            if (err) {
                // Display an error in the med entry modal
                $scope.saveMedicationStatus = 'error';
            } else {
                // Display success in the med entry modal
                $scope.saveMedicationStatus = 'success';
                setTimeout(function () {
                    $route.reload();
                }, 100);
            }
        });
        $scope.medReset();
    }

    // Meds active/inactive selector
    $scope.activeSelection = ['active', 'inactive'];

    $scope.toggleSelection = function toggleSelection(buttonName) {
        var idx = $scope.activeSelection.indexOf(buttonName);

        // is currently selected
        if (idx > -1) {
            $scope.activeSelection.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.activeSelection.push(buttonName);
        }
    };

    $scope.drugSearch = function drugSearch(drugName) {
        $scope.drugSearchActive = true;
        console.log("drugname: " + drugName);
        if ($scope.selectedDrug) {
            $scope.selectedDrug = null;
        }
        if ($scope.rxnormResults) {
            $scope.rxnormResults = null;
        }
        if ($scope.rximagesResults) {
            $scope.rximagesResults = null;
        }
        $scope.pDrugName = drugName;
        $scope.drugError = null;
        $scope.drugWarning = null;
        $scope.drugSpelling = null;
        medapi.findRxNormGroup(drugName, function (err, data) {
            //console.log("rxnormgroup data: "+JSON.stringify(data));
            $scope.drugSearchActive = false;
            if (err) {
                console.log("Err: " + err);
            } else {
                if (data.drugGroup.conceptGroup === undefined || data.drugGroup.conceptGroup === null) {
                    //$scope.rxnormResults = "No match found";
                    medapi.findRxNormSpelling(drugName, function (err2, data2) {
                        if (err2) {
                            console.log("Err: " + err2);
                            $scope.drugError = "No matches found.  Please Try Something Else";
                        } else {
                            if (data2.suggestionGroup !== null) {
                                if (data2.suggestionGroup.suggestionList !== null) {
                                    if (data2.suggestionGroup.suggestionList.suggestion !== null) {
                                        if (data2.suggestionGroup.suggestionList.suggestion.length > 0) {
                                            $scope.drugWarning = "No matches found... did you mean one of these: ";
                                            $scope.drugSpelling = data2.suggestionGroup.suggestionList.suggestion;
                                        } else {
                                            $scope.drugError = "No matches found.  Please Try Something Else";
                                        }
                                    } else {
                                        $scope.drugError = "No matches found.  Please Try Something Else";
                                    }
                                } else {
                                    $scope.drugError = "No matches found.  Please Try Something Else";
                                }
                            } else {
                                $scope.drugError = "No matches found.  Please Try Something Else";
                            }
                        }
                    });
                } else {
                    $scope.rxnormResults = data;
                    var drugCount = 0;
                    for (var j = 0; j < data.drugGroup.conceptGroup.length; j++) {
                        if (data.drugGroup.conceptGroup[j].conceptProperties) {
                            drugCount += data.drugGroup.conceptGroup[j].conceptProperties.length;
                        }
                    }
                    $scope.drugError = null;
                    $scope.drugCount = drugCount;
                    /*
                    medapi.fdaName(drugName, function (err, data) {
                        if (err) {
                            console.log("ERR: " + err);
                        } else {
                            $scope.openfdanameResults = data;
                        }
                    });
*/
                }
                /*
                medapi.findImages(data.idGroup.rxnormId[0], function (err, imageData) {
                    if (err) {
                        console.log("Err: " + err);
                    } else {
                        $scope.rximageResults = imageData;
                    }
                });
                medapi.fdaCode(data.idGroup.rxnormId[0], function (err, fdaData) {
                    if (err) {
                        console.log("Err: " + err);
                    } else {
                        $scope.openfdacodeResults = fdaData;
                    }
                });
                medapi.findmedline(data.idGroup.rxnormId[0], drugName, function (err, medlineData) {
                    if (err) {
                        console.log("err: " + err);
                    } else {
                        $scope.medlineResults = medlineData;
                    }
                });
*/
            }
        });
    };

    $scope.setSelectedDrug = function setSelectedDrug() {
        if (this.rxdrug.selected) {
            this.rxdrug.selected = false;
            $scope.selectedDrug = null;
        } else {
            if ($scope.rxnormResults.compiled !== null) {
                for (var j = 0; j < $scope.rxnormResults.compiled.length; j++) {
                    $scope.rxnormResults.compiled[j].selected = false;
                }
            }
            this.rxdrug.selected = true;
            $scope.selectedDrug = this.rxdrug;
        }
    };

    $scope.setSelectedPrescriber = function setSelectedPrescriber() {
        if (this.prescriber.selected) {
            this.prescriber.selected = false;
            $scope.selectedPrescriber = null;
        } else {
            for (var k = 0; k < $scope.prescriberResults.length; k++) {
                $scope.prescriberResults[k].selected = false;
            }
            this.prescriber.selected = true;
            $scope.selectedPrescriber = this.prescriber;
        }
    };

    $scope.setSelectedImage = function setSelectedImage(rxImage) {
        if (rxImage.selected) {
            rxImage.selected = false;
            $scope.selectedImage = null;
        } else {
            for (var k = 0; k < $scope.rximageResults.nlmRxImages.length; k++) {
                $scope.rximageResults.nlmRxImages[k].selected = false;
            }
            rxImage.selected = true;
            $scope.selectedImage = rxImage;
        }
    };

    $scope.prescriberSearch = function prescriberSearch(firstName, lastName, zipCode, state) {
        $scope.prescriberSearchActive = true;
        var searchTest = false;
        var searchObj = {
            name: [],
            address: []
        };
        $scope.selectedPrescriber = null;
        if (firstName !== "" && lastName !== "") {
            searchObj.name.push({
                first: firstName,
                last: lastName
            });
            searchTest = true;
        } else {
            if (lastName !== "") {
                searchObj.name.push({
                    last: lastName
                });
                searchTest = true;
            }
        }
        if (zipCode !== "" && state !== "") {
            searchObj.address.push({
                zip: zipCode,
                state: state
            });
            searchTest = true;
        } else {
            if (zipCode !== "") {
                searchObj.address.push({
                    zip: zipCode
                });
                searchTest = true;
            }
            if (state !== "") {
                searchObj.address.push({
                    state: state
                });
                searchTest = true;
            }
        }
        if (searchTest) {
            npiapi.findNPI(searchObj, function (err, data) {
                $scope.prescriberSearchActive = false;
                if (err) {
                    console.log("Martz err: " + err);
                    $scope.prescriberError = "No matches found, please try again";
                } else {
                    console.log("Martz success: " + JSON.stringify(data));
                    $scope.prescriberResults = data;
                    $scope.prescriberCount = data.length;
                    $scope.prescriberError = null;
                }
            });
        }
    };

    $scope.initInfoSearch = function (sType) {
        if (sType === 'prescription') {
            $scope.medSearchType = 'prescription';
        } else {
            $scope.medSearchType = 'otc-supplement';
        }
        $scope.entryStep = 1;
    };

    $scope.medReset = function () {
        console.log("RESETTING MEDICATION ENTRY");
        $scope.prescriberResults = null;
        $scope.pFirstName = null;
        $scope.pLastName = null;
        $scope.pZip = null;
        $scope.pDrugName = null;
        //$scope.openfdanameResults = null;
        $scope.rxnormResults = null;
        //$scope.medlineResults = null;
        $scope.rximageResults = null;
        //$scope.openfdacodeResults = null;
        $scope.selectedDrug = null;
        $scope.selectedPrescriber = null;
        $scope.drugError = null;
        $scope.drugWarning = null;
        $scope.prescriberError = null;
        $scope.entryStep = 0;
        $scope.pWhy = "";
        $scope.pAdminister = "";
        $scope.pDose = "";
        $scope.pOften = "";
        $scope.pLast = "";
        $scope.pCurrentMedRadio = true;
        $scope.pStart = "";
        $scope.drugSpelling = null;
    };
    /*
        $scope.medInfoSearch = function medInfoSearch(searchObj) {
            console.log("searchObj: " + searchObj);
            drugSearch(searchObj.drug);
            if ($scope.medSearchType === 'prescription') {
                prescriberSearch(searchObj.first, searchObj.last, searchObj.zip);
            }
        };
    */
    //this doesn't really do anything at the moment
    /*
        $scope.swapMedTabs = function swapMedTabs(entryClass) {
            if (entryClass === "drug") {
                $("#drug").addClass("in");
                $("#prescriber").removeClass("in");
                $("#summary").removeClass("in");
            } else if (entryClass === "prescriber") {
                $("#drug").removeClass("in");
                $("#prescriber").addClass("in");
                $("#summary").removeClass("in");
            } else if (entryClass === "summary") {
                $("#drug").removeClass("in");
                $("#prescriber").removeClass("in");
                $("#summary").addClass("in");
            }
        };
    */
    console.log(Date.now(), " MAGIC OF DATASERVICE STARTS!");

    function refresh() {
        dataservice.curr_section = $scope.entryType;
        dataservice.getData(function () {
            console.log(Date.now(), "MAGIC IS HERE: ", dataservice.processed_record);
            //console.log("MORE: ", dataservice.all_merges, dataservice.merges_record, dataservice.merges_billing);

            pageRender(dataservice.master_record, dataservice.all_notes);
            $scope.masterMatches = dataservice.curr_processed_matches;

            //update merges in scope
            $scope.mergesList_record = dataservice.merges_record;
            $scope.mergesList_billing = dataservice.merges_billing;
            $scope.mergesList = dataservice.all_merges;
        });
    }

    refresh();

    $scope.$on('ngRepeatFinished', function (element) {
        if (dataservice.curr_location) {
            $location.hash(dataservice.curr_location);
            $anchorScroll();
            dataservice.curr_location = null;
            $location.hash("");
        }
    });

    //Flip All as active selected item in DOM
    function getHistory() {
        history.getHistory(function (err, history) {
            if (err) {
                console.log('ERRROR', err);
            } else {
                //console.log('>>>>accountHistory', history);
                $scope.accountHistory = history;
            }
        });
    }
    getHistory();

    // produces singular name for section name - in records merges list
    $scope.singularName = function (section) {
        switch (section) {
        case 'social_history':
            return 'social history';
        case 'vitals':
            return 'vital sign';
        case 'allergies':
            return 'allergy';
        case 'medications':
            return 'medication';
        case 'problems':
            return 'problem';
        case 'claims':
            return 'claim';
        case 'results':
            return 'test result';
        case 'encounters':
            return 'encounter';
        case 'immunizations':
            return 'immunization';
        case 'procedures':
            return 'procedure';
        case 'claims':
            return 'claim';
        case 'insurance':
            return 'insurance';
        case 'payers':
            return 'payer';
        default:
            return section;
        }
    };

    function pageRender(data, data_notes) {

        //calculate current height/weight/bmi/blood pressure
        //based on processed record from $scope.recordEntries
        function dashPrep() {
            var weightDateArray = [];
            var heightDateArray = [];
            var bpDateArraySystolic = [];
            var bpDateArrayDiastolic = [];
            //Build arrays of all dates per section.
            _.each($scope.recordEntries, function (entry) {
                var vitalEntry = {};
                //skip non vitals entries
                if (entry.category !== "vitals") {
                    return;
                } else {
                    vitalEntry = entry;
                }
                console.log("vital entry ", vitalEntry);

                if (vitalEntry.data.vital.name === "Height") {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        heightDateArray.push(moment(dateArr.date));
                    });
                }
                if (vitalEntry.data.vital.name === "Patient Body Weight - Measured") {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        weightDateArray.push(moment(dateArr.date));
                    });
                }
                if (vitalEntry.data.vital.name === "Intravascular Systolic") {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        bpDateArraySystolic.push(moment(dateArr.date));
                    });
                }
                if (vitalEntry.data.vital.name === "Intravascular Diastolic") {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        bpDateArrayDiastolic.push(moment(dateArr.date));
                    });
                }
            });
            //Flag maxes.
            var heightMaxDate = moment.max(heightDateArray);
            var weightMaxDate = moment.max(weightDateArray);
            var bpMaxDateDiastolic = moment.max(bpDateArrayDiastolic);
            var bpMaxDateSystolic = moment.max(bpDateArraySystolic);
            //Recover associated max value.
            _.each($scope.entries.vitals, function (vitalEntry2) {
                var vitalEntry = {
                    "data": vitalEntry2
                };

                //Find most current height.
                if (vitalEntry.data.vital.name.indexOf("Height") > -1) {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        if (moment(moment(dateArr.date)).isSame(heightMaxDate, 'day')) {
                            $scope.dashMetrics.height = {
                                value: vitalEntry.data.value,
                                unit: vitalEntry.data.unit
                            };
                        }
                    });
                }
                if (vitalEntry.data.vital.name.indexOf("Weight") > -1) {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        if (moment(moment(dateArr.date)).isSame(weightMaxDate, 'day')) {
                            $scope.dashMetrics.weight = {
                                value: vitalEntry.data.value,
                                unit: vitalEntry.data.unit
                            };
                        }
                    });
                }
                if (vitalEntry.data.vital.name.indexOf("Systolic") > -1) {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        if (moment(moment(dateArr.date)).isSame(bpMaxDateSystolic, 'day')) {
                            $scope.dashMetrics.systolic = {
                                value: vitalEntry.data.value,
                                unit: vitalEntry.data.unit
                            };
                        }
                    });
                }
                if (vitalEntry.data.vital.name.indexOf("Diastolic") > -1) {
                    _.each(vitalEntry.data.date_time, function (dateArr) {
                        if (moment(moment(dateArr.date)).isSame(bpMaxDateDiastolic, 'day')) {
                            $scope.dashMetrics.diastolic = {
                                value: vitalEntry.data.value,
                                unit: vitalEntry.data.unit
                            };
                        }
                    });
                }
            });

            console.log("dash metrics >>>>", $scope.dashMetrics);

            //convert height to inches if needed
            if ($scope.dashMetrics.height.unit === "cm") {
                $scope.dashMetrics.height.unit = "[in_us]";
                $scope.dashMetrics.height.value = 0.393701 * $scope.dashMetrics.height.value;
                $scope.dashMetrics.height.value = Math.round($scope.dashMetrics.height.value);
            }

            //Format height output.
            if ($scope.dashMetrics.height.unit === "[in_us]") {
                var displayHeight = Math.floor(($scope.dashMetrics.height.value / 12)) + "' " + Math.floor($scope.dashMetrics.height.value % 12) + '"';
                $scope.dashMetrics.height.disp = displayHeight;
            }

            //convert weight to lbs
            if ($scope.dashMetrics.weight.unit === "kg") {
                $scope.dashMetrics.weight.unit = "[lb_av]";
                $scope.dashMetrics.weight.value = 2.20462 * $scope.dashMetrics.weight.value;
            }
            //Format weight output.
            if ($scope.dashMetrics.weight.unit === "[lb_av]") {
                var displayWeight = Math.floor($scope.dashMetrics.weight.value) + " lbs";
                $scope.dashMetrics.weight.disp = displayWeight;
            }
            //BMI Calculation
            //Expects US units.
            function calculateBMI(weight, height) {
                var BMI = (weight * 703) / (height * height);
                BMI = BMI.toFixed(1);
                return BMI;
            }
            $scope.dashMetrics.bmi = calculateBMI($scope.dashMetrics.weight.value, $scope.dashMetrics.height.value);
        }

        //$scope.entryList = [];

        /*
        function formatDates() {
            //Flatten to timeline.
            console.log($scope.entries);

            _.each($scope.entries, function(entry, section) {
                _.each(entry, function(item) {
                    var tmpItem = item;
                    console.log(tmpItem);
                    tmpItem.category = section;
                    $scope.entryList.push(tmpItem);
                });
            });

            _.each($scope.entryList, function(entry) {

                console.log(entry.data.date_time);

                _.each(entry.data.date_time, function(dateEntry, dateTitle) {
                    if (dateTitle !== 'displayDate' && dateTitle !== 'plotDate') {
                        format.formatDate(dateEntry);
                    }
                });

                //Have to generate date for results.
                if (entry.category === 'results') {
                    var dateArray = [];
                    entry.data.date_time = {};

                    //Fill out each result's individual date.
                    if (entry.data.results) {
                        _.each(entry.data.results, function(result) {
                            _.each(result.date_time, function(dateEntry, dateTitle) {
                                if (dateTitle !== 'displayDate' && dateTitle !== 'plotDate') {
                                    format.formatDate(dateEntry);
                                    dateArray.push(moment(dateEntry.date));
                                }
                            });
                            result.date_time.displayDate = format.outputDate(result.date_time);
                        });
                    }

                    var momentMin = moment.min(dateArray);
                    var momentMax = moment.max(dateArray);

                    //If date min and max are equal, consolidate.
                    //Only have test data, should expand to other cases in deploy.
                    if (momentMin.isSame(momentMax, 'day')) {
                        entry.data.date_time.point = {};
                        entry.data.date_time.point.date = momentMin.toISOString();
                        entry.data.date_time.point.precision = 'day';
                        entry.data.date_time.point.displayDate = format.formatDate(entry.data.date_time.point);
                    }

                }

                entry.data.date_time.displayDate = format.outputDate(entry.data.date_time);
                entry.data.date_time.plotDate = format.plotDate(entry.data.date_time);
            });
        }
        */

        function sortList() {
            $scope.entryList = _.sortBy($scope.entryList, function (entry) {
                return entry.data.date_time.plotDate;
            });
            $scope.entryList.reverse();
        }

        function filterEntries(val) {
            console.log("UNFILTERED ", $scope.recordEntries);

            $scope.entryListFiltered = _.where($scope.recordEntries, {
                category: val
            });

            console.log("filtered ", $scope.entryListFiltered);
            console.log("val", val);
            // Filter on active/inactive
            if (val === 'medications' || val === 'social') {
                if ($scope.activeSelection.indexOf('active') > -1 && $scope.activeSelection.indexOf('inactive') > -1) { // All entries

                } else if ($scope.activeSelection.indexOf('active') > -1) { // Active only

                    $scope.entryListFiltered = _.filter($scope.entryListFiltered, function (entry) {
                        var curDate = new Date();
                        var entryDate = new Date();
                        if (angular.isDefined(entry.data.date_time) && angular.isDefined(entry.data.date_time.high)) {
                            entryDate = new Date(entry.data.date_time.high.date);
                        }
                        return (entry.category === val) && (entryDate >= curDate);
                    });
                } else if ($scope.activeSelection.indexOf('inactive') > -1) { // Inactive only
                    $scope.entryListFiltered = _.filter($scope.entryListFiltered, function (entry) {
                        var curDate = new Date();
                        var entryDate = new Date();
                        if (angular.isDefined(entry.data.date_time) && angular.isDefined(entry.data.date_time.high)) {
                            entryDate = new Date(entry.data.date_time.high.date);
                        }
                        return (entry.category === val) && (entryDate < curDate);
                    });
                } else { // None
                    $scope.entryListFiltered = [];
                }
            }

            console.log("FILTERED ", $scope.entryListFiltered);
        }

        $scope.recordEntries = dataservice.processed_record;
        console.log("processed record ", dataservice.processed_record);
        console.log("master record ", dataservice.master_record);

        $scope.entries = dataservice.master_record;

        console.log(">>> master record ", $scope.entries);

        dashPrep();
        //formatDates();
        //sortList();
        $scope.tabs.activeTab = 0;

        $scope.recordEntries = _.sortBy($scope.recordEntries, function (entry) {
            if (entry.metadata.datetime[0]) {
                return entry.metadata.datetime[0].date.substring(0, 9);
            } else {
                return '1979-12-12';
            }
        }).reverse();

        if ($scope.entryType === "all") {
            $scope.entryListFiltered = $scope.recordEntries;
        } else {
            $scope.entryType = dataservice.curr_section;

            filterEntries($scope.entryType);
        }

        //$scope.pageLoaded = false;

        if (_.isEmpty(dataservice.curr_section)) {
            $scope.entryType = "all";
        } else {
            $scope.entryType = dataservice.curr_section;
        }

        //Flip All as active selected item in DOM
        angular.element("#nav" + $scope.entryType).addClass("active");

        $scope.$watch('activeSelection', function (newVal, oldVal) {
            filterEntries($scope.entryType);
        }, true);

        $scope.$watch('entryType', function (newVal, oldVal) {
            //keeping current section name in scope
            //alert('entryType new:'+newVal+" old:"+oldVal);
            $scope.entryType = newVal;
            dataservice.curr_section = $scope.entryType;
            console.log("$scope.entryType = ", $scope.entryType);

            if (newVal !== oldVal) {
                $window.scrollTo(0, 0);
                if (newVal === "all") {
                    $scope.$broadcast('tabchange', {
                        "val": $scope.tabs.activeTab
                    });
                    $scope.entryListFiltered = $scope.recordEntries;

                    dataservice.curr_section = "all";
                    $scope.entryType = dataservice.curr_section;
                } else {
                    filterEntries(newVal);

                    dataservice.curr_section = newVal;
                    $scope.entryType = dataservice.curr_section;
                }
                if (newVal === "vitals") {
                    $scope.$broadcast('tabchange', {
                        "val": 0
                    });
                }
            }

            //TODO get matches data again, here

            dataservice.curr_section = $scope.entryType;
            dataservice.getMatchesData(function () {

                $scope.masterMatches = dataservice.curr_processed_matches;
                $scope.recordEntries = dataservice.processed_record;

                $scope.recordEntries = _.sortBy($scope.recordEntries, function (entry) {
                    if (entry.metadata.datetime[0]) {
                        return entry.metadata.datetime[0].date.substring(0, 9);
                    } else {
                        return '1979-12-12';
                    }
                }).reverse();

            });

            $scope.pageLoaded = !$scope.pageLoaded;

        });

        /*
        var delayInMilliseconds = 250;
        setTimeout(function() {
            // Your code here (triggering timeline to reload)
            console.log("page loaded trigger");
            $scope.pageLoaded = !$scope.pageLoaded;

        }, delayInMilliseconds);
        */

    }

    //console.log(">>>>>>", record.masterRecord, record.recordDirty);

    $scope.goToMatches = function (section) {
        //console.log(section);
        //matches.setSection(section);
        $location.path('/matches');
    };
    //launch specific match (by ID and section name)
    $scope.launchMatch = function (el) {
        console.log("Launch MATCH>> ", el);
        //console.log(section);
        //setting section name for matches page
        matches.setSection(el.match.section);
        //TODO: set match ID for match page
        matches.setMatchId(el.match.match_id);

        $location.path('/matches');
    };

});
