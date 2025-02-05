//go:build !mono

package main

import (
	sdkapi "sdk/api"

	"com.flarego.default-theme/app"
	"com.flarego.default-theme/app/themes"
)

type Config struct {
    BannerText   string `json:"banner_text"`
    IntegerField int    `json:"integer_field"`
    BooleanField bool   `json:"boolean_field"`
}

func main() {}

func Init(api sdkapi.IPluginApi) {
	app.SetupRoutes(api)
	themes.SetPortalTheme(api)
	themes.SetAdminTheme(api)
}
