## Table of Contents

* [Updating Copy](#updating-copy)
  - [Formatting](#formatting)
  - [Special Cases](#special-cases)
    * [Admin Screen](#admin-screen)
    * [Start Over Button](#start-over-button)
  - [Applying Updates](#applying-updates)

# Updating Copy

Most of the copy for the screens is stored in `data.json` files.
These files are formatted in JSON. 
If you are not comfortable editing JSON
I recommend you use a tool like [JSON Editor Online][0] 
to edit the contents of the file.

These are simple text files, unfortunately editing them using OSX's Text Edit
program usually makes them unreadable by the program. 
I suggest editing them in [Text Wrangler][1] 
or using a terminal-based text editor such as `nano`.

Each screen is in its own directory. 
The screens for _Performance for the Screen_ are located in
`MMI_Interactives/Webserver/static/performance/`.
The screens for _Design an Anything Muppet_ are located in
`MMI_Interactives/Webserver/static/anythingmuppets/`.
For instance, if you would like to edit the text for the attract screen
of the _Design an Anything Muppet_ installation, you would edit
`MMI_Interactives/Webserver/static/anythingmuppets/attract/data.json`

The copy for the screen is stored in a section called `"copy"`.
As of this writing, the file for the 
_Design an Anything Muppet_ attract screen is

```
{
	"name":"attract",
	"disableTimeout":true,
	"buttons":[{"type":"next","text":"Start"}],
	"breakButton":false,
	"copy":{
		"large":"Design an<br />Anything Muppet<br />Character",
		"next":"Start"
	}
}
```

Let's say we wanted to change the button on that screen 
to say "Begin" instead of "Start".
We would edit the `"next"` portion of the `"copy"` section like so:

```
		"next":"Begin"
```

And our new `data.json` file would be

```
{
	"name":"attract",
	"disableTimeout":true,
	"buttons":[{"type":"next","text":"Start"}],
	"breakButton":false,
	"copy":{
		"large":"Design an<br />Anything Muppet<br />Character",
		"next":"Begin"
	}
}
```

After making your copy updates, you should restart the installation.
You can do this by either clicking the 
`Restart program` button on the admin screen,
or by logging out and logging back into the computer.

## Formatting

If you would like to add detailed formatting to the text,
you can do so using HTML markup. As seen in the example above,
the `"large"` portion of the `"copy"` section uses `<br />` HTML tags to
insert line breaks. You can also use `<em>` tags or `<span>` tags to further
costumize the formatting of the copy as desired.

## Special Cases

### Admin Screen

Some of the copy on the Admin screen is directly in the HTML for the page.
You can edit it by editing `admin/template.hbr` 
if you are comfortable editing HTML. 
Since this is not a public-facing screen, 
we didn't think it needed to support copy updates.

### Start Over Button

There is a button in the top right of most screens allowing you to start over, 
and in some cases skip forward. 
This button is handled by a special section titled `"breakButton"`.
In order to not show the button at all, you would have `"breakButton":false`
as demonstrated in the attract screen example above.

We can look at the contents of the Introductory screen from 
_Performance for the Screen_ to see how to edit the copy. 
Here are the contents of 
`MMI_Interactives/Webserver/static/performance/intro/data.json` 
at the time of writing

```
{
	"name":"intro",
	"breakButton":{
		"text":"Skip intro",
		"event":"special"
	},
	"audio":"vo/perf_vo_01.mp3",
	"copy":{
		"large":"Choose a puppet",
		"next":"Continue"
	},
	"disableTimeout":false
}
```

The `"breakButton"` section has a `"text"` part 
which allows you to customize the copy shown on the button.

## Applying Updates

It is important to remember that copy updates will be overwritten when using the update script to install an updated version of the installation.


[0]: http://www.jsoneditoronline.org/
[1]: https://itunes.apple.com/us/app/textwrangler/id404010395?mt=12