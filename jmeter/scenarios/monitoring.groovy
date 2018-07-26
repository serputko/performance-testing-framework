/*
	Copyright © 2017-2018 Anton Serputko. Contacts: serputko.a@gmail.com
	  
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

import org.apache.jmeter.samplers.SampleResult;
import org.apache.jmeter.assertions.AssertionResult;

/*
	Set response message and send it to influxdb
	Write detailed error responses to jmeter log
*/ 

def transactionController = sampler.getThreadContext().getPreviousResult().getParent();

/*
	Check if previous failed sampler has parent and parent does not have sampler data. That means that parent is transaction controller.
*/
if(!sampleResult.isSuccessful()){
	if(transactionController && !transactionController.getSamplerData()){
		handleParentTransactionController(transactionController);
	}else if(sampleResult.getSamplerData()){
		handleSampler(sampleResult);
	}	
}

/*
	Change responseMessage for all sub samplers of Transaction controller and set them to Transaction controller response message
	Post all sub samplers trace to log
*/
def handleParentTransactionController(SampleResult transactionSampleResult) {
	def transactionResponseMessage = "\r"+transactionSampleResult.getResponseMessage()+"\r";
	def subResults = transactionSampleResult.getSubResults();
	def assertions;
	if(subResults){
		for (int i=0; i<subResults.length; i++){
			if(!subResults[i].isSuccessful()){
				assertions = subResults[i].getAssertionResults();
				updateSampleResponseMessage(subResults[i], assertions);
				transactionResponseMessage = transactionResponseMessage+subResults[i].getSampleLabel()+"; "+subResults[i].getResponseMessage();
				postTraceToLog(subResults[i], assertions);
			}
		}
		transactionSampleResult.setResponseMessage(transactionResponseMessage.replaceAll("\n", "\r"));
	}
}

/*
	Change responseMessage for sampler and post trace to log
*/
def handleSampler(SampleResult sampleResult) {
	def assertions = sampleResult.getAssertionResults();
		updateSampleResponseMessage(sampleResult, assertions);
		sampleResult.setResponseMessage(sampleResult.getResponseMessage().replaceAll("\n", "\r"));
		postTraceToLog(sampleResult, assertions);
}

def updateSampleResponseMessage(SampleResult sampleResult, AssertionResult[] assertions) {
	def responseMessage = sampleResult.getResponseMessage();
	sampleResult.setResponseMessage("Response message: "+sampleResult.getResponseMessage()+";"+"\rStatus code: "+sampleResult.getResponseCode()+
		";"+"\rNumber of failed assertions: "+assertions.length+"\r"+generateResponseTrace(sampleResult)+"\r"+generateAssertionTrace(assertions))+";";
}

def generateResponseTrace(SampleResult sample) {
	def sampleResult = sample;
	def responseLogMessage = "\r"+
		"Sample Failed: "+sampleResult.toString()+"\r"+
		"Started at: "+new Date(sampleResult.getStartTime())+"\r"+
		"Finished at: "+new Date(sampleResult.getEndTime())+"\r"+
		"Request:\r"+
		sampleResult.getSamplerData()+"\r"+
		"REQUEST DATA\r"+
		"URL: "+
		sampleResult.getUrlAsString()+"\r"+
		"Request headers: \r"+
		sampleResult.getRequestHeaders()+"\r"+
		"Response: \r" +
		sampleResult.getResponseMessage()+"\r"+
		"Response code:" + sampleResult.getResponseCode()+"\r\r"+
		"Response data:\r"+
		sampleResult.getResponseDataAsString()+"\r";
	return responseLogMessage;
}

/*
	Generate log trace for all failed assertions of sampler
*/
def generateAssertionTrace(AssertionResult[] assertions) {
	def assertionLogMessage = "";
	
	assertionLogMessage = "Assertion results:\r" +
	"Number of failed assertions: "+assertions.length+"\r"+assertionLogMessage;
	if(assertions.length>0){
		for(int j=0; j<assertions.length; j++){
			assertionLogMessage = assertionLogMessage + assertions[j].getName() + " Failed; \r" + 
			"Failure Message: " + assertions[j].getFailureMessage()+";\r"
		}
	}
	return assertionLogMessage+"\r\r"
}

def postTraceToLog(SampleResult sample, AssertionResult[] assertions) {
	print(generateResponseTrace(sample)+"\r"+generateAssertionTrace(assertions));
	}