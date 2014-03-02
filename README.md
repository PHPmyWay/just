# just

__just__ is a tiny, simple and powerful AJAX library that also allows you to do multiple upload in easy way and without flash fallbacks.
His minimized weight is less than 5Kb.


## Browser Support

The purpose of __just__ is to provide as simple as possible cool features given by the newest technologies.
For this reason the browser support is as the follow:

> IE 10+
> Firefox 26+
> Chrome 31+
> Safari 6+
> Opera 19+

(according caniuse.com, the browser support rate it's about the 76%)


## Some Examples

A simple GET request

    justGet('resource.html')
        .done(function(data){ console.log(data); });

A simple POST request

    justPost('resource.php', {'hello':'world'})
        .done(function(data){ console.log(data); });

You can also define more than one event

    justPost('resource.php', {'hello':'world'})
        .done(function(data){ console.log(data); })
        .fail(function(xhr){ console.log('something goes wrong'); })
        .always(function(xhr){ console.log('this will always print'); });

And you can prepare a resource..

    var resource = justPrepare('resource.php')
        .done(function(data){ console.log(data); });

..to request later in your script

    resource.post({'hello':'world'});
    
and, sure, you can add more events if you need

    resource.post({'hello':'world'})
        .done(function(){ console.log('Awesome!'); });


## The Uploader Feature

First of all, you need a simple input object in your html and a button,
optionally you can create also the progress bar:

    <input id="file" type="file" name="file[]" multiple>
    <progress id="loading" value="0" min="0" max="100"></progress> 
    <button id="start">Start Upload</button>

    
And now here is the magic (and don't forget to register the click event on the button)

    justUpload('fileupload.php', document.getElementById('file'))
        .uploading(function(progress){
            document.getElementById('loading').value = progress.value;
        });

The progress object contains the following properties:
__value__ a percentage value of the upload progress
__loaded__ total bytes uploaded
__total__ total bytes to upload


## Software License Agreement (MIT)

> Copyright (c) just
> 
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation
> files (the "Software"), to deal in the Software without
> restriction, including without limitation the rights to use,
> copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the
> Software is furnished to do so, subject to the following
> conditions:
> 
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> The author name must be present.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
> OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
> HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
> WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
> FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
> OTHER DEALINGS IN THE SOFTWARE.