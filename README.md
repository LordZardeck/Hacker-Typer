## How To Use

There are various options availabe to configure how you want to use the HackerTyper plugin.

The only required options are either file or text. File allows you to specify a text file which contains the code to type. Text is a variable containing the code to type.

Below is an example use:

```javascript
$(
	function(){

		$("#console").HackerTyper({
			file: "kernel.txt",
			speed: 9,
			control: $.HackerTyper.control.keyPress,
			complete: function() 
			{
				setTimeout(function(){
					$("#console").remove();
					$.HackerTyper.showAccess();
				}, 2000);					
			}
		});					
	}
);
```

## License 

(c) Copyright 2011 Simone Masiero. Some Rights Reserved. 

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/3.0/">
	<img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/3.0/au/88x31.png" />
</a>

This work is licensed under a [Creative Commons Attribution-Noncommercial-Share Alike 3.0 License](http://creativecommons.org/licenses/by-nc-sa/3.0/).