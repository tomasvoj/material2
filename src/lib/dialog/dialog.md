The `MdDialog` service can be used to open modal dialogs with Material Design styling and 
animations.

<!-- example(dialog-overview) -->

A dialog is opened by calling the `open` method with a component to be loaded and an optional 
config object. The `open` method will return an instance of `MdDialogRef`:

```ts
let dialogRef = dialog.open(UserProfileComponent, {
  height: '400px',
  width: '600px',
});
```

The `MdDialogRef` provides a handle on the opened dialog. It can be used to close the dialog and to
receive notification when the dialog has been closed.

```ts
dialogRef.afterClosed().subscribe(result => {
  console.log(`Dialog result: ${result}`); // Pizza!
});

dialogRef.close('Pizza!');

```

Components created via `MdDialog` can _inject_ `MdDialogRef` and use it to close the dialog
in which they are contained. When closing, an optional result value can be provided. This result
value is forwarded as the result of the `afterClosed` promise. 

### Sharing data with the Dialog component.
If you want to share data with your dialog, you can use the `data` option to pass information to the dialog component.

```ts
let dialogRef = dialog.open(YourDialog, {
  data: 'your data',
});
```

To access the data in your dialog component, you have to use the MD_DIALOG_DATA injection token:
```ts
import {Component, Inject} from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'your-dialog',
  template: 'passed in {{ data }}',
})

export class YourDialog {
  constructor(@Inject(MD_DIALOG_DATA) public data: any) { }
}
```

### Dialog content
Several directives are available to make it easier to structure your dialog content:

| Name                  | Description                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `md-dialog-title`     | \[Attr] Dialog title, applied to a heading element (e.g., `<h1>`, `<h2>`)|
| `<md-dialog-content>` | Primary scrollable content of the dialog                                 |
| `<md-dialog-actions>` | Container for action buttons at the bottom of the dialog                 |
| `md-dialog-close`     | \[Attr] Added to a `<button>`, makes the button close the dialog on click|

Once a dialog opens, the dialog will automatically focus the first tabbable element.

You can control which elements are tab stops with the `tabindex` attribute

```html
<button md-button tabindex="-1">Not Tabbable</button>
```

### AOT Compilation

Due to the dynamic nature of the `MdDialog`, and its usage of `ViewContainerRef#createComponent()`
to create the component on the fly, the AOT compiler will not know to create the proper
`ComponentFactory` for your dialog component by default.

You must include your dialog class in the list of `entryComponents` in your module definition so
that the AOT compiler knows to create the `ComponentFactory` for it.

```ts
@NgModule({
  imports: [
    // ...
    MaterialModule
  ],

  declarations: [
    AppComponent,
    ExampleDialogComponent
  ],

  entryComponents: [
    ExampleDialogComponent
  ]

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule() {}
```
