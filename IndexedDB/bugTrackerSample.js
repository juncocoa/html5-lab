var read_only = 1;
var read_write = 0;
var version_change = 2;

var bugDB = {};

bugDB.db = "bugDatabase";
bugDB.objectStore = "bugs";
bugDB.keyPath = "id";
bugDB.indexProject = "project";
bugDB.indexProjectKeyPath = "project";
bugDB.indexTitle = "title";
bugDB.indexTitleKeyPath = "title";
bugDB.indexPriority = "priority";
bugDB.indexPriorityKeyPath = "priority";
bugDB.indexStatus = "status";
bugDB.indexStatusKeyPath = "status";
bugDB.indexDetails = "details";
bugDB.indexDetailsKeyPath = "details";
bugDB.searchResults = [];
bugDB.version = "1.0";
bugDB.txnMode = read_write;
bugDB.txnTimeout = 2000;

function output_trace(sMsg)
{

	var oTrace = document.getElementById("traceoutput");
	if ((oTrace != null ) || (oTrace != undefined))
	{
		if (oTrace.value == "")
			oTrace.value = sMsg;
		else
			oTrace.value = oTrace.value + "\n"+ sMsg;
	}
}
	
	// function to output trace
function output_error(sError)
{
	var oError = document.getElementById("erroroutput");
	if ((oError != null) || (oError != undefined))
	{
		if (oError.value == "")
			oError.value = sError;
		else
			oError.value = oError.value +  "\n" + sError;
	}
}
	
function commitTransaction(txn)
{
	try
	{
		if (txn)
		{
		
			txn.db.close();
		}
	}
	catch (e)
	{
		output_error("Error in commitTransaction(): " + e.message);
	}
}

function abortTransaction(txn)
{
	try
	{
		if (txn)
		{
			txn.onabort = function ()
			{
				if (txn.db)
					txn.db.close();
			}
			txn.abort();
		}
	}
	catch (e)
	{
		output_error("Error in abortTransaction(): " + e.message);
	}
}
//Storing functions
bugDB.storeNewBug = function (project, title, priority, status, details, id) 
{	
	var db  = null;
	try
	{
		var oRequestDB = null;
		var oRequestSetVersion = null;
		var oRequestObjectStore = null;
		var oRequestPut = null;
		var index1 = null;
		var index2 = null;
		var index3 = null;
		var index4 = null;
		var index5 = null;
		var store = null;
		var txn = null;

	    oRequestDB = window.indexedDB.open(bugDB.db);
	    oRequestDB.onsuccess = function (evt)
	    {
	        db = evt.result;
	        var whenReady = function (oTxn)
	        {
	        	try
	        	{
		        	if (oTxn == null) // if no passed then create a transaction
	   					txn =  db.transaction(null, bugDB.txnMode, bugDB.txnTimeout);			
	   				else
	   					txn = oTxn;
					var objectStore = txn.objectStore(bugDB.objectStore);
					if(id == "") {
						var newEntry = { project: project, title: title, priority: priority, status: status, details: details};
						oRequestPut = objectStore.put(newEntry);
					}
					else {
						var existingEntry = { project: project, title: title, priority: priority, status: status, details: details, id: parseFloat(id)};
						oRequestPut = objectStore.put(existingEntry);
					}
		 
					oRequestPut.onsuccess = function (evt)
					{
						bugDB.resetInputForm();
						(id == "") ? output_trace("New bug #" + evt.result + " successfully saved to local storage") : output_trace("Bug #" + id + " successfully updated");
						commitTransaction(txn);
					}
					oRequestPut.onerror = function (evt)
					{                   
						output_error(evt.code + " - " + evt.message);
						abortTransaction(txn);	
					}
				}
				catch (e)
				{
					output_error("Error in whenReady(): " + e.message);
				}
	        };
	
	        
	        if (db.objectStoreNames.contains(bugDB.objectStore)) {
	            whenReady(null);
	        }
	        else {
	        	oRequestSetVersion = db.setVersion(bugDB.version);
	        	oRequestSetVersion.onsuccess = function (evt)
	        	{
	        		var txn = evt.result;
	   	            store  = db.createObjectStore(bugDB.objectStore, bugDB.keyPath, true);	          
	                index1 = store.createIndex(bugDB.indexProject, bugDB.indexProjectKeyPath, false);            	                
	                index2 = store.createIndex(bugDB.indexTitle, bugDB.indexTitleKeyPath, false);            	                
		            index3 = store.createIndex(bugDB.indexPriority, bugDB.indexPriorityKeyPath, false);    	                 
                    index4 = store.createIndex(bugDB.indexStatus, bugDB.indexStatusKeyPath, false);    
                    index5 = store.createIndex(bugDB.indexDetails, bugDB.indexDetailsKeyPath, false);    
                    whenReady(txn);		                         
	            }
	            oRequestSetVersion.onerror = function (evt)
	            {
	                output_error(evt.code + " - " + evt.message);
					abortTransaction(txn);	
	            }        
	            oRequestSetVersion.onblocked = function (evt)
	            {
		            output_error("Object store and indexes cannot be created since the database is locked. Please close all browser sessions and try again");
					abortTransaction(txn);	
	            }
	        }
	
	    }
	    oRequestDB.onerror = function (evt)
	    {
	        output_error(evt.code + " - " + evt.message);
			abortTransaction(txn);		   
		}
	}
	catch (e)
	{
		output_error("Error in bugDB.storeNewBug(): " + e.message);
	     if (db)
	          	db.close();	
	}	  
};

function deleteDB() {
  try {
      var dbreq = window.indexedDB.deleteDatabase(bugDB.db);
      dbreq.onsuccess = function (event) {
          var db = event.result;
          output_trace("indexedDB: " + indexedDBName + " deleted");
      }
      dbreq.onerror = function (event) {
          output_trace("indexedDB.delete Error: " + event.message);
      }
  }
  catch (e) {
      output_trace("Error: " + e.message);
  }
}

bugDB.clearAllEntries = function () {
	var db  = null;
	try
	{
	    var oRequestDB = null;
		var oRequestSetVersion = null;
		var oRequestDelStore = null;
			 
	    oRequestDB = window.indexedDB.open(bugDB.db);   
	    oRequestDB.onsuccess = function (evt) {
	        db = evt.result;	       
	        if (db.objectStoreNames.contains(bugDB.objectStore)) {
	        	oRequestSetVersion = db.setVersion(bugDB.version);
	        	oRequestSetVersion.onsuccess = function (evt) {
		        	oRequestDelStore = db.deleteObjectStore(bugDB.objectStore);
		        	oRequestDelStore.onsuccess = function (evt) {
		                bugDB.resetInputForm();
		                bugDB.clearSearchResults();
		                output_trace("All bugs deleted successfully");
               	        if (db)
		                	db.close();
		              //  deleteDB();
		            }
		            oRequestDelStore.onerror = function (evt) {
		                output_error(evt.code + " - " + evt.message);
	               	    if (db)
		                	db.close();
		            }                   	     
	        	}
	        	oRequestSetVersion.onerror = function (evt) {
		        	output_error(evt.code + " - " + evt.message);
	      		    if (db)
		        		db.close();
	        	}
	        	oRequestSetVersion.onblocked = function (evt) {
	       		    if (db)
	        			db.close();
		        	output_error("The database seems to be in use by a different browser tab/instance. Cannot execute the transaction for deleting object store. Please close all browser instances and try again!");
	        	}
            }
	        else {
	            output_trace("Database is already empty");
        	    if (db)
	            	db.close();
	        }
	    }        
	    oRequestDB.onerror = function (evt) {
	        output_error(evt.code + " - " + evt.message);
	    }    
	}
	catch (e)
	{
		output_error("Error in bugDB.clearAllEntries(): " + e.message);
	     if (db)
	          	db.close();		
	}	  
};


//Search Functions

//Search on project
bugDB.findProjectSearchResults = function () { 
	var db  = null;
	try
	{
		var oRequestDB = null;
		var oRequestObjectStore = null;
		var oRequestIndex = null;
		var oRequestKeyCursor = null;
		var oRequestMove = null;
		var store = null;
		var cursor = null;
		var txn = null;
		var index = null;
		
	    oRequestDB = window.indexedDB.open(bugDB.db);    
	    oRequestDB.onsuccess = function (evt) {
	    	db = evt.result;
	    	txn = db.transaction();
            txn.oncomplete = function (evt){ //This will not get called because of auto-commit (scrupt does not call commit()) that is triggered on db.closer()
               //do next search
                bugDB.findTitleSearchResults();
            }
            txn.onabort = function (evt) {
                output_trace(evt.code + " - " + evt.message);
            }	                                    

	        if (db.objectStoreNames.contains(bugDB.objectStore)) {
       	        store = txn.objectStore(bugDB.objectStore);	                
          	    index  = store.index(bugDB.indexProject);
                var searchCriteria = document.getElementById('searchproject').value;                    
                if (searchCriteria == "") {
                    oRequestKeyCursor = index.openKeyCursor();
                }
                else {
                    var range = window.IDBKeyRange.only(searchCriteria);
                    oRequestKeyCursor = index.openKeyCursor(range);
                }
                
                oRequestKeyCursor.onsuccess = function (evt) {
                    var addSearchResult = function () {
                        oRequestMove = cursor.move();                    
                        oRequestMove.onsuccess = function (evt) {
                            var result = cursor.value;
                            if (result !== undefined) {
                                bugDB.addUniqueResult(result);
                                addSearchResult();
                            }
                            else {
                            	if (db)
	                                db.close();
                                bugDB.findTitleSearchResults();
                            }
                        }
                        oRequestMove.onerror = function (evt) {
                            output_error(evt.code + " - " + evt.message);
                        }
                    }
                    cursor = evt.result;
                    addSearchResult();
                }
                oRequestKeyCursor.onerror = function (evt) {
                    output_error(evt.code + " - " + evt.message);
                }	                	                
	        }
	        else {
	            bugDB.displaySearchResults();
	        }
	    }        
	    oRequestDB.onerror = function (evt) {
	        output_error(evt.code + " - " + evt.message);
	    }    
	}
	catch (e)
	{
		output_error("Error in bugDB.findProjectSearchResults(): " + e.message);
	    if (db)
	          	db.close();		
		
	}
};

//Search on title
bugDB.findTitleSearchResults = function () { 
	var db  = null;
	try
	{
		var oRequestDB = null;
		var oRequestObjectStore = null;
		var oRequestIndex = null;
		var oRequestKeyCursor = null;
		var oRequestMove = null;
		var store = null;
		var cursor = null;
		var txn = null;
		var index = null;

	    var tempArray = [];
	    oRequestDB = window.indexedDB.open(bugDB.db);    
	    oRequestDB.onsuccess = function (evt) {
	        db = evt.result;
            txn = db.transaction();
            txn.oncomplete = function (evt) { // This will not get called because of auto commit on db.close()
                //merge lists then do next search
                bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
                bugDB.findPrioritySearchResults();	                                        
            }
            txn.onabort = function (evt) {
                output_trace(evt.code + " - " + evt.message);
            }	                                   
                       
		    if (db.objectStoreNames.contains(bugDB.objectStore)) {
				store = txn.objectStore(bugDB.objectStore);	            
		            index  = store.index(bugDB.indexTitle);
                    var searchCriteria = document.getElementById('searchtitle').value;                    
                    if (searchCriteria == "") {
                        oRequestKeyCursor = index.openKeyCursor();
                    }
                    else {
                        var range = window.IDBKeyRange.only(searchCriteria);
                        oRequestKeyCursor = index.openKeyCursor(range);
                    }
                    
                    oRequestKeyCursor.onsuccess = function (evt) {
                        var addSearchResult = function () {
                            oRequestMove = cursor.move();                    
                            oRequestMove.onsuccess = function (evt) {
                                var result = cursor.value;
                                if (result !== undefined) {
                                    bugDB.addUniqueResult(result, tempArray);
                                    addSearchResult();
                                }
                                else {
	                                if (db)
	                                	db.close();
                                    //merge lists then do next search
                                    bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
                                    bugDB.findPrioritySearchResults();	                                        
	                                
                                }
                            }
                            oRequestMove.onerror = function (evt) {
                                output_error(evt.code + " - " + evt.message);
                            }
                        }
                        cursor = evt.result;
                        addSearchResult();
                    }
                    oRequestKeyCursor.onerror = function (evt) {
                        output_error(evt.code + " - " + evt.message);
                    }	                
                }	                                               
	    }        
	    oRequestDB.onerror = function (evt) {
	        output_error(evt.code + " - " + evt.message);
	    }    
	}
	catch (e)
	{
		output_error("Error in bugDB.findTitleSearchResults(): " + e.message);
	    if (db)
	          	db.close();			
	}	
};

//Search on Priority
bugDB.findPrioritySearchResults = function () { 
	var db  = null;
	try
	{
		var oRequestDB = null;
		var oRequestObjectStore = null;
		var oRequestIndex = null;
		var oRequestKeyCursor = null;
		var oRequestMove = null;
		var store = null;
		var cursor = null;
		var txn = null;
		var index = null;

	    var tempArray = [];
		oRequestDB = window.indexedDB.open(bugDB.db);    

	    oRequestDB.onsuccess = function (evt) {
	        db = evt.result;
            txn = db.transaction();		    
            txn.oncomplete = function (evt) { // this will not get called because of auto commit on db.close()
	            //merge lists then do next search
                bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
                bugDB.findStatusSearchResults();
            }
            txn.onabort = function (evt) {
                output_trace(evt.code + " - " + evt.message);
                if (txn.db)
                    	txn.db.close();
	        }
	        	
	        if (db.objectStoreNames.contains(bugDB.objectStore)) {
				store = txn.objectStore(bugDB.objectStore);	            
   	                index = store.index(bugDB.indexPriority);
   	                    var searchCriteria = document.getElementById('searchpriority').value;                    
	                    if (searchCriteria == "All") {
	                        oRequestKeyCursor = index.openKeyCursor();
	                    }
	                    else {
	                        var range = window.IDBKeyRange.only(searchCriteria);
	                        oRequestKeyCursor = index.openKeyCursor(range);
	                    }

	                    oRequestKeyCursor.onsuccess = function (evt) {
	                        var addSearchResult = function () {
   	                            oRequestMove = cursor.move();                    
	                            oRequestMove.onsuccess = function (evt) {
	                                var result = cursor.value;
	                                if (result !== undefined) {
	                                    bugDB.addUniqueResult(result, tempArray);
	                                    addSearchResult();
	                                }
	                                else {
	                                	if (db)
	                                    	db.close();
                                        //merge lists then do next search
                                        bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
	                                    bugDB.findStatusSearchResults();	                                                            
	                                }
	                            }
	                            oRequestMove.onerror = function (evt) {
	                                output_error(evt.code + " - " + evt.message);
	                            }
	                        }
	                        cursor = evt.result;
	                        addSearchResult();
	                    }
	                    oRequestKeyCursor.onerror = function (evt) {
	                        output_error(evt.code + " - " + evt.message);
	                    }
	        }
	    }        
	    oRequestDB.onerror = function (evt) {
	        output_error(evt.code + " - " + evt.message);
	    }    
	  }
	  catch (e)
	  {
		  output_error("Error in bugDB.findPrioritySearchResults(): " + e.message);
		  if (db)
	          	db.close();			
	  }
};

//Search on status
bugDB.findStatusSearchResults = function () { 
	var db = null;
	try
	{
		var oRequestDB = null;
		var oRequestObjectStore = null;
		var oRequestIndex = null;
		var oRequestKeyCursor = null;
		var oRequestMove = null;
		var store = null;
		var cursor = null;
		var txn = null;
		var index = null;

	    var tempArray = [];
	    oRequestDB = window.indexedDB.open(bugDB.db);    
	    oRequestDB.onsuccess = function (evt) {
	        db = evt.result;
            txn = db.transaction();		    
            txn.oncomplete = function (evt) {// this will not get called because of auto commit() on db.close()
                //merge lists
                bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
                bugDB.findDetailsSearchResults();
            }
            txn.onabort = function (evt) {
                output_trace(evt.code + " - " + evt.message);
            }	                             
	        
	        if (db.objectStoreNames.contains(bugDB.objectStore)) {
				store = txn.objectStore(bugDB.objectStore);
	                index = store.index(bugDB.indexStatus);
	                    var searchCriteria = document.getElementById('searchstatus').value;                    
	                    if (searchCriteria == "All") {
	                        oRequestKeyCursor = index.openKeyCursor();
	                    }
	                    else {
	                        var range = window.IDBKeyRange.only(searchCriteria);
	                        oRequestKeyCursor = index.openKeyCursor(range);
	                    }
	                    
	                    oRequestKeyCursor.onsuccess = function (evt) {
	                        var addSearchResult = function () {
                                 oRequestMove = cursor.move();                    
	                             oRequestMove.onsuccess = function (evt) {
	                                var result = cursor.value;
	                                if (result !== undefined) {
	                                    bugDB.addUniqueResult(result, tempArray);
	                                    addSearchResult();
	                                }
	                                else {
	                                	   if (db)
	                                       	db.close();
                                        	 //merge lists
 	                                       bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
	                                       bugDB.findDetailsSearchResults();
	                                }
	                            }
	                            oRequestMove.onerror = function (evt) {
	                                output_error(evt.code + " - " + evt.message);
	                            }	                    
	                        }
	                        cursor = evt.result;
	                        addSearchResult();
	                    }
	                    oRequestKeyCursor.onerror = function (evt) {
	                        output_error(evt.code + " - " + evt.message);
	                    }	                
	        }
	    }        
	    oRequestDB.onerror = function (evt) {
	        output_error(evt.code + " - " + evt.message);
	    }    
	}
	catch (e)
	{
		  output_error("Error in bugDB.findStatusSearchResults(): " + e.message);
		  if (db)
	          	db.close();			
	}
};

//Search on status
bugDB.findDetailsSearchResults = function () { 
	var db = null;
	try
	{
		var oRequestDB = null;
		var oRequestObjectStore = null;
		var oRequestIndex = null;
		var oRequestKeyCursor = null;
		var oRequestMove = null;
		var store = null;
		var cursor = null;
		var txn = null;
		var index = null;

	    var tempArray = [];
	    oRequestDB = window.indexedDB.open(bugDB.db);    
	    oRequestDB.onsuccess = function (evt) {
	        db = evt.result;
            txn = db.transaction();		    
            txn.oncomplete = function (evt) {// this will not get called because of auto-commit on db.close()
                //merge lists
                bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
                bugDB.displaySearchResults();
  				if (txn.db)
					txn.db.close();	                                       
            }
            txn.onabort = function (evt) {
                output_trace(evt.code + " - " + evt.message);
   				if (txn.db)
					txn.db.close();	                                       

            }	                             

	        if (db.objectStoreNames.contains(bugDB.objectStore)) {
				store = txn.objectStore(bugDB.objectStore);
	                index = store.index(bugDB.indexDetails);
	                    var searchCriteria = document.getElementById('details').value;                    
	                    if (searchCriteria == "") {
	                        oRequestKeyCursor = index.openKeyCursor();
	                    }
	                    else {
	                        var range = window.IDBKeyRange.only(searchCriteria);
	                        oRequestKeyCursor = index.openKeyCursor(range);
	                    }
	                    
	                    oRequestKeyCursor.onsuccess = function (evt) {
	                        var addSearchResult = function () {
                                 oRequestMove = cursor.move();                    
	                             oRequestMove.onsuccess = function (evt) {
	                                var result = cursor.value;
	                                if (result !== undefined) {
	                                    bugDB.addUniqueResult(result, tempArray);
	                                    addSearchResult();
	                                }
	                                else {
	                                	if (db)
                                        	db.close();
                                        //merge lists
                                        bugDB.searchResults = bugDB.arrayIntersection(bugDB.searchResults, tempArray);
	                                    bugDB.displaySearchResults();
	                                }
	                            }
	                            oRequestMove.onerror = function (evt) {
	                                output_error(evt.code + " - " + evt.message);
	                            }	                    
	                        }
	                        cursor = evt.result;
	                        addSearchResult();
	                    }
	                    oRequestKeyCursor.onerror = function (evt) {
	                        output_error(evt.code + " - " + evt.message);
	                    }	                
	        }
	    }        
	    oRequestDB.onerror = function (evt) {
	        output_error(evt.code + " - " + evt.message);
	    }    
	}
	catch (e)
	{
		  output_error("Error in bugDB.findDetailsSearchResults(): " + e.message);
		  if (db)
	          	db.close();			
	}
};

bugDB.showBugDetails = function (id) {
	var db = null;
	try
	{
		var oRequestDB = null;
		var oRequestObjectStore = null;
		var oRequestGet = null;
		var store = null;
		var cursor = null;
		var txn = null;
		var index = null;

	    oRequestDB = window.indexedDB.open(bugDB.db);
	    oRequestDB.onsuccess = function (evt)
	    {
	        db = evt.result;
   	        txn = db.transaction();	        
		    store = txn.objectStore(bugDB.objectStore);	            
			oRequestGet = store.get(id);
			oRequestGet.onsuccess = function (evt)
			{
				var myResult = evt.result;
				document.getElementById('id').value = myResult.id;
				document.getElementById('title').value = myResult.title;
				document.getElementById('project').value = myResult.project;
				document.getElementById('priority').value = myResult.priority;
				document.getElementById('status').value = myResult.status;
				document.getElementById('details').value = myResult.details;
			}
			oRequestGet.onerror = function (evt)
			{
				output_error(evt.code + " - " + evt.message);
			}
	    }
	    oRequestDB.onerror = function (evt)
	    {
	        output_error(evt.code + " - " + evt.message);
	    }
	}
	catch(e)
	{
		 output_error("Error in bugDB.showBugDetails(): " + e.message);
		 if (db)
	       	db.close();				    
	}
};


//Helper functions
bugDB.addUniqueResult = function (result, array) {
	try
	{
	    if(array == undefined) {
	        if(!bugDB.containsInSearchResults(bugDB.searchResults, result)) {
	            bugDB.searchResults.push(result);
	        }
	    }
	    else {
	        if(!bugDB.containsInSearchResults(array, result)) {
	            array.push(result);
	        }
	    }
	}
    catch (e)
    {
    	 output_error("Error in bugDB.addUniqueResult(): " + e.message);
    }
};

bugDB.displaySearchResults = function () {
	try
	{
	    bugDB.clearSearchResults();
	    
	    if(bugDB.searchResults.length == 0) {
	        bugDB.displayNoResultsFound();
	        return;
	    }
	    
	    var p = document.createElement("P");
//	    var text = document.createTextNode("Search Results:");
//	    p.appendChild(text);
	    
	    var searchDiv = document.getElementById('searchResults');
	    searchDiv.appendChild(p);
	    
	    while (bugDB.searchResults.length > 0) {
	        var result = bugDB.searchResults.pop();
	        bugDB.appendSearchResult(result);
	    }
    }
    catch (e)
	{
	 	 output_error("Error in bugDB.displaySearchResults(): " + e.message);
	}
    
};


bugDB.displayNoResultsFound = function () {
	try
	{
	    var p = document.createElement("P");
	    var text = document.createTextNode("No results found");
	    p.appendChild(text);                        
	    var searchDiv = document.getElementById('searchResults');
	    searchDiv.appendChild(p);
    }
     catch (e)
	 {
	 	 output_error("Error in bugDB.displayNoResultsFound(): " + e.message);
	 }

};

bugDB.appendSearchResult = function(result) {
	try
	{
	 //   var resultInnerDiv = document.createElement("DIV");
	   
// 	    var elementHtml = "<a href='#' onclick='bugDB.showBugDetails(" + result.id + "); return(false);'>";
	    var element = document.createElement("A");
	    element.href = '#';
	 //   element.onclick = 'bugDB.showBugDetails("' + result.id + '"); return(false);';
	 	var sValue =  'bugDB.showBugDetails(' + result.id + ');return false;';
	    element.setAttribute('onclick',sValue);

	    element.innerHTML = result.title;
	    
	   // resultInnerDiv.appendChild(element);
	
	    var searchDiv = document.getElementById('searchResults');
	    // searchDiv.appendChild(resultInnerDiv);
  	    searchDiv.appendChild(element);
	    var elemBr = document.createElement("br");
	    searchDiv.appendChild(elemBr);
	 }
	 catch (e)
	 {
	 	 output_error("Error in bugDB.appendSearchResult(): " + e.message);
	 }
};

bugDB.clearSearchResults = function() {
	try
	{
	    var searchResultsDiv = document.getElementById('searchResults');
	    if (searchResultsDiv.hasChildNodes()) {
	        while ( searchResultsDiv.childNodes.length >= 1 ) {
	            searchResultsDiv.removeChild(searchResultsDiv.firstChild);
	        }
	    } 
	}
	catch (e)
	{
		 output_error("Error in bugDB.clearSearchResults(): " + e.message);
	}
};

bugDB.containsInSearchResults = function(array, item) {
	try
	{
	    var i = array.length;
	    while (i--) {
	        var r = array[i];
	        if (r.id === item.id) {
	            return true;
	        }
	    }
	    return false;    
	 }
	 catch (e)
	 {
	 	 output_error("Error in bugDB.containsInSearchResults(): " + e.message);
	 }  
};

bugDB.arrayIntersection = function(array1, array2) {
	try
	{
	    var temp = [];
	    var i = array1.length;
	    while (i--) {
	        if(bugDB.containsInSearchResults(array2, array1[i])) {
	            temp.push(array1[i]);
	        }
	    }
	    return temp;
	  }
	  catch (e)
	  {
		   output_error("Error in bugDB.arrayIntersection(): " + e.message);
	  }
};

bugDB.resetInputForm = function () {
	try
	{
	    document.getElementById('id').value = "";
	    document.getElementById('title').value = "";
	    document.getElementById('project').value = "";
	    document.getElementById('priority').value = "P1";
	    document.getElementById('status').value = "Active";
	    document.getElementById('details').value = "";
	  //  document.getElementById('traceoutput').value = "";
	  //  document.getElementById('erroroutput').value = "";
	}
 	catch (e)
  	{
	    output_error("Error in bugDB.resetInputForm(): " + e.message);
	}
}

bugDB.resetSearchForm = function () {
	try
	{
	    document.getElementById('searchproject').value = "";
	    document.getElementById('searchtitle').value = "";
	    document.getElementById('searchpriority').value = "";
	    document.getElementById('searchstatus').value = "";
   	    document.getElementById('searchdetails').value = "";
	 }
	 catch (e)
	 {
		 output_error("Error in bugDB.resetSearchForm(): " + e.message);
	 }
}


//Extention method on Array
Array.prototype.contains = function(obj) {
	try
	{
	  var i = this.length;
	  while (i--) {
	    if (this[i] === obj) {
	      return true;
	    }
	  }
	  return false;
	 }
	 catch (e)
	 {
	 	 output_error("Error in Array.prototype.contains(): " + e.message);
	 }
};


