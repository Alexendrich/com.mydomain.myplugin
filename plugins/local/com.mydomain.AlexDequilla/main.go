package main

import (
	"fmt"
	"net/http"

	sdkapi "sdk/api"
)

func main() {}

func Init(api sdkapi.IPluginApi) {
	// Your plugin code here
	httpAPI := api.Http()
	pluginConfigAPI := api.Config().Plugin()
	adminRouter := httpAPI.HttpRouter().AdminRouter()

	// Define the settings form
	settingsForm := sdkapi.HttpForm{
		Name:          "settings",
		CallbackRoute: "settings.save",
		SubmitLabel:   "Submit",
		Sections: []sdkapi.FormSection{
			{
				Name: "General Configuration",
				Fields: []sdkapi.IFormField{
					// Existing Banner Text field
					sdkapi.FormTextField{
						Name:  "Banner Text",
						Label: "Banner Text",
						ValueFn: func() string {
							b, err := pluginConfigAPI.Read("banner_text")
							if err != nil {
								return "This is the default banner text!"
							}
							return string(b)
						},
					},
					// New Integer Field
					sdkapi.FormNumberField{
						Name:  "Integer Field",
						Label: "Integer Field",
						ValueFn: func() int {
							b, err := pluginConfigAPI.Read("integer_field")
							if err != nil {
								return 3 // Default value
							}
							// Convert to int from string (assuming the value is stored as string)
							var intValue int
							fmt.Sscanf(string(b), "%d", &intValue)
							return intValue
						},
					},
					// New Boolean Field
					sdkapi.FormCheckboxField{
						Name:  "Boolean Field",
						Label: "Boolean Field",
						ValueFn: func() bool {
							b, err := pluginConfigAPI.Read("boolean_field")
							if err != nil {
								return true // Default value
							}
							// Convert to bool from string (assuming the value is stored as string)
							var boolValue bool
							fmt.Sscanf(string(b), "%t", &boolValue)
							return boolValue
						},
					},
				},
			},
		},
	}

	// Register the settings form
	if err := httpAPI.Forms().RegisterForms(settingsForm); err != nil {
		api.Logger().Error("Failed to register settings form: %s", err)
		return
	}

	// Add a new route group to the admin router
	adminRouter.Group("/settings", func(subrouter sdkapi.IHttpRouterInstance) {

		// Show the settings form
		subrouter.Get("/form", func(w http.ResponseWriter, r *http.Request) {
			// Retrieve the registered form
			form, ok := httpAPI.Forms().GetForm("settings")
			if !ok {
				httpAPI.HttpResponse().Error(w, r, fmt.Errorf("Form not found"), http.StatusInternalServerError)
				return
			}

			// Render the form template
			htmlForm := form.GetTemplate(r)
			httpAPI.HttpResponse().AdminView(w, r, sdkapi.ViewPage{PageContent: htmlForm})
		}).Name("settings.form")

		// Save the settings
		subrouter.Post("/save", func(w http.ResponseWriter, r *http.Request) {
			// Retrieve the registered settings form
			form, ok := httpAPI.Forms().GetForm("settings")
			if !ok {
				httpAPI.HttpResponse().Error(w, r, fmt.Errorf("Form not found"), http.StatusInternalServerError)
				return
			}

			// Parse the form values
			if err := form.ParseForm(r); err != nil {
				httpAPI.HttpResponse().Error(w, r, err, http.StatusInternalServerError)
				return
			}

			// Retrieve the values for Banner Text, Integer Field, and Boolean Field
			bannerText, err := form.GetStringValue("General Configuration", "Banner Text")
			if err != nil {
				httpAPI.HttpResponse().Error(w, r, err, http.StatusInternalServerError)
				return
			}

			integerField, err := form.GetIntValue("General Configuration", "Integer Field")
			if err != nil {
				httpAPI.HttpResponse().Error(w, r, err, http.StatusInternalServerError)
				return
			}

			booleanField, err := form.GetBoolValue("General Configuration", "Boolean Field")
			if err != nil {
				httpAPI.HttpResponse().Error(w, r, err, http.StatusInternalServerError)
				return
			}

			// Persist the values to the plugin configuration
			pluginConfigAPI.Write("banner_text", []byte(bannerText))
			pluginConfigAPI.Write("integer_field", []byte(fmt.Sprintf("%d", integerField)))
			pluginConfigAPI.Write("boolean_field", []byte(fmt.Sprintf("%t", booleanField)))

			// Respond with a success message
			httpAPI.HttpResponse().FlashMsg(w, r, "Settings saved successfully", sdkapi.FlashMsgSuccess)
			httpAPI.HttpResponse().Redirect(w, r, "settings.form")

		}).Name("settings.save")
	})

	// Register navigation menu items
	httpAPI.Navs().AdminNavsFactory(func(r *http.Request) []sdkapi.AdminNavItemOpt {
		return []sdkapi.AdminNavItemOpt{
			{
				Category:  sdkapi.NavCategorySystem,
				Label:     "Sample Plugin",
				RouteName: "settings.form",
			},
		}
	})
}
