/*!
 * just
 *
 * Copyright (C) Salvatore Rotondo
 * Licensed under the MIT license
 *
 * Creation Date: Mon Oct 07 00:39:41 2013
*/
(function(w) {

    var justAjax, jaXHR;
    
    var isEmpty = function(o) {
        return typeof o=='undefined'||o==null||o=='';
    };
    
    if (!jaXHR) {
        jaXHR = w.XMLHttpRequest;
        
        if (isEmpty(new jaXHR().sendAsBinary) && !isEmpty(w.Uint8Array)) {
            jaXHR.prototype.sendAsBinary = function(data) {
                function byteValue(x) {
                    return x.charCodeAt(0) & 0xff;
                }
                var ords = Array.prototype.map.call(data, byteValue);
                var ui8a = new Uint8Array(ords);
                this.send(ui8a.buffer);
            };
        }
    }
     
    var parseJSON = function(j) {
        try {
            return JSON.parse(j);
        } catch (e) {
            return j;
        }
    };
    
    var httpBuildQuery = function(qStringObj) {
        var qString = [];
        for (var key in qStringObj)
            qString.push(key+'='+qStringObj[key]);
        
        return qString.join('&');
    };
    
    var events = {};
    
    var justEventRegister = function(event, data, rData) {
        var id = rData.requestId();

        if (isEmpty(events[id]))
            events[id] = {};
            
        if (isEmpty(events[id][event]))
            events[id][event] = [];
                
        events[id][event].push(data);
        return rData;
    };
    
    var justEventCaller = function(event, data, id, xhr) {
        if (!isEmpty(events[id])) {
            if (!isEmpty(events[id][event]) && events[id][event].length > 0)
                for (var i in events[id][event])
                    if (event == 'jaDone' || event == 'jaUploading')
                        events[id][event][i](data, xhr);
                    else
                        events[id][event][i](xhr);
            
            if (event != 'jaUploading')
                events[id][event] = [];
        }
    };
    
    w.justAjax = function(resource, method, data, headers) {
        var running = true,
            sBoundary = null,
            requestId = new Date().getTime();
        
        method = isEmpty(method)? 'get' : method.toLowerCase();
        headers = isEmpty(headers)? {} : headers;
        data = isEmpty(data)? null : data;
        
        if (method != 'get' && isEmpty(headers['Content-type'])) {
            headers['Content-type'] = 'application/x-www-form-urlencoded';
        }else if (headers['Content-type'] == 'multipart/form-data') {
            sBoundary = "---------------------------" + Date.now().toString(16);
            headers['Content-type'] += '; boundary=' + sBoundary; 
        }
        
        if (typeof data == 'object' && isEmpty(sBoundary))
                data = httpBuildQuery(data);
                
        if (method == 'get')
            resource += '?' + data;
        
        headers['X-Requested-With'] = 'XMLHttpRequest';
        
        var xhr = new jaXHR();
        xhr.open(method, resource, true);
        
        for (var header in headers)
            xhr.setRequestHeader(header, headers[header]);
        
        xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
                running = false;
                var output = parseJSON(xhr.responseText);
            
				if (xhr.status >= 200 && xhr.status < 300)
                    justEventCaller('jaDone', output, requestId);
				else
                    justEventCaller('jaFail', output, requestId);
				
                justEventCaller('jaAlways', output, requestId);
			}
		};
        
        if (!isEmpty(sBoundary) && !isEmpty(xhr.upload)) {
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    justEventCaller('jaUploading', {value: parseInt((e.loaded/e.total)*10000)/100, loaded: e.loaded, total: e.total}, requestId);
                }
            };
        }
                
        if (!isEmpty(sBoundary))
            xhr.sendAsBinary('--' + sBoundary + "\r\n" + data.join('--' + sBoundary + "\r\n") + '--' + sBoundary + "--\r\n");
        else
            xhr.send(data);
        
        return {
            requestId : function() {
                return requestId;
            },
            
            isRunning : function() {
                return running;
            },
            
            abort : function() {
                return xhr.abort();
            },
            
            done : function(callback) {
                return justEventRegister('jaDone', callback, this);
            },
        
            fail :  function(callback) {
                return justEventRegister('jaFail', callback, this);
            },
            
            always :  function(callback) {
                return justEventRegister('jaAlways', callback, this);
            },
            
            uploading :  function(callback) {
                return justEventRegister('jaUploading', callback, this);
            }
        };
    };
    
    justAjax = w.justAjax;
    
    w.justPrepare = function(resource, headers) {
        var ev = {done:[], fail:[], always:[]};
        
        return {
            resource: resource,
            
            headers: headers,
            
            done : function(cb) {
                ev['done'].push(cb);
                return this;
            },
        
            fail :  function(cb) {
                ev['fail'].push(cb);
                return this;
            },
            
            always :  function(cb) {
                ev['always'].push(cb);
                return this;
            },
            
            get: function(data){
                var ja = justAjax(resource, 'get', data, headers);
                
                for (var event in ev)
                    for (var i in ev[event])
                        ja[event](ev[event][i]);
                
                return ja;
            },
            
            post: function(data){
                var ja = justAjax(resource, 'post', data, headers);
                
                for (var event in ev)
                    for (var i in ev[event])
                        ja[event](ev[event][i]);
                
                return ja;
            },
        }
    };
    
    w.justGet = function(resource, data, headers) {
        return justAjax(resource, 'get', data, headers);
    };
    
    w.justPost = function(resource, data, headers) {
        return justAjax(resource, 'post', data, headers);
    };
    
    w.justUpload = function(resource, fileRef) {
        if (isEmpty(w.FileReader))
            return false;
        
        var ja;
        var ev = {done:[], fail:[], always:[], uploading:[]};
        var file,
            fread,
            segments = [],
            segmentsStatus = 0;
        
        var processStatus = function() {
            if (segmentsStatus > 0)
                return;
                
            ja = justAjax(resource, 'post', segments, {'Content-type':'multipart/form-data'});
            
            for (var event in ev)
                    for (var i in ev[event])
                        ja[event](ev[event][i]);
        };
        
        for (var nFile = 0; nFile < fileRef.files.length; ++nFile) {
            file = fileRef.files[nFile];
            fread = new FileReader();
            fread.segIndex = segments.length;
            
            fread.onload = function(frEv) {
                segments[this.segIndex] += frEv.target.result + "\r\n";
                --segmentsStatus;
                processStatus();
            };
            
            segments.push("Content-Disposition: form-data; name=\"" + fileRef.name + "\"; filename=\""+ file.name + "\"\r\nContent-Type: " + file.type + "\r\n\r\n");
            ++segmentsStatus;
            
            fread.readAsBinaryString(file);
        }
                
        return {
            requestId : function() {
                return ja.requestId();
            },
            
            isRunning : function() {
                return ja.isRunning();
            },
            
            abort : function() {
                return ja.abort();
            },
            
            done : function(cb) {
                ev['done'].push(cb);
                return this;
            },
        
            fail :  function(cb) {
                ev['fail'].push(cb);
                return this;
            },
            
            always :  function(cb) {
                ev['always'].push(cb);
                return this;
            },
            
            uploading :  function(cb) {
                ev['uploading'].push(cb);
                return this;
            }
        };
    };
    
})(window);