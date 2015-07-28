describe('Enter new medication information:', function () {

    afterEach(function () {
		browser.manage().logs().get('browser').then(function (browserLog) {
			var errors = 0
			browserLog.forEach(function (log) {
				if (log.level.value >= 1000) {
					errors++;
				};
			})
			expect(errors).toEqual(0);
			// Uncomment to actually see the log.
			// console.log('log: ' + require('util').inspect(browserLog));
		});
	});
	
	it('show drug search results', function() {
		browser.get('http://localhost:3000/');
        browser.driver.manage().window().setSize(1280, 1024);
		var record = element(by.css('[ng-click="vm.navbarClick(\'record\')"]'));
		record.click();

		var medications = element(by.id('navmedications'));
		medications.click();

		var addMed = element(by.css('[ng-click="entryModal()"]'));
		addMed.click();

		var prescription = element(by.css('[ng-click="initInfoSearch(\'prescription\')"]'));
		prescription.click();
		
		// drug info
		var drugName = element(by.model('pDrugName'));
		drugName.sendKeys('Xanax');
		var search = element(by.css('[ng-click="drugSearch(pDrugName)"]'));
		search.click();
		
		var firstRow = element(by.repeater('rxdrug in rxnormResults.compiled').row(0));
		firstRow.click();
	});
	
	it('show provider search results', function() {
		var next = element(by.css('[ng-click="nextStep()"]'));
		next.click();
		
		// provider info
		var provFirstName = element(by.model('pFirstName'));
		var provLastName = element(by.model('pLastName'));
		provFirstName.sendKeys('Shelly');
		provLastName.sendKeys('Senders');
		search = element(by.css('[ng-click="prescriberSearch(pFirstName, pLastName, pState)"]'));
		search.click();
		
		firstRow = element(by.repeater('prescriber in prescriberResults').row(0));
		firstRow.click();
	});
	
	it('show collected info', function() {
		next = element(by.css('[ng-click="nextStep()"]'));
		next.click();
		
		// additional info
		var medStartDate = element(by.css('[ng-model="$parent.pStart"]'));
		medStartDate.sendKeys('11/16/2001')
		next = element(by.css('[ng-click="nextStep()"]'));
		next.click();
	});
	
	it('should save successfully', function() {
		var submit = element(by.css('[ng-click="saveMedication()"]'));
		submit.click();
	});
});