﻿<%@ Page Title="" Language="C#" MasterPageFile="~/Areas/aspx/Views/Shared/Web.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
<style>
    <!-- Load Pako ZLIB library to enable PDF compression -->
    <script src="@Url.Content("~/Scripts/pako.min.js")"></script>
</style>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
<div class="box">
    <h4>Advanced Export options</h4>
    <div class="box-col">
        <button class='export-pdf k-button'>Export as PDF</button>
    </div>
    <div class="box-col">
        <button class='export-img k-button'>Export as Image</button>
    </div>
    <div class="box-col">
        <button class='export-svg k-button'>Export as SVG</button>
    </div>
</div>

<script>
    $(".export-pdf").click(function () {
        var chart = $("#chart").getKendoChart();
        chart.exportPDF({ paperSize: "auto", margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" } }).done(function (data) {
            kendo.saveAs({
                dataURI: data,
                fileName: "chart.pdf",
                proxyURL: "<%= Url.Action("Export_Save", "Chart_Api") %>"
        });
    });
});

$(".export-img").click(function () {
    var chart = $("#chart").getKendoChart();
    chart.exportImage().done(function (data) {
        kendo.saveAs({
            dataURI: data,
            fileName: "chart.png",
            proxyURL: "<%= Url.Action("Export_Save", "Chart_Api") %>"
        });
    });
});

$(".export-svg").click(function () {
    var chart = $("#chart").getKendoChart();
    chart.exportSVG().done(function (data) {
        kendo.saveAs({
            dataURI: data,
            fileName: "chart.svg",
            proxyURL: "<%= Url.Action("Export_Save", "Chart_Api") %>"
        });
    });
});
</script>

<div class="chart-wrapper">
    <%= Html.Kendo().Chart()
        .Name("chart")
        .Title(title => title
            .Text("Hybrid car mileage report")
            .Font("bold 16px 'DejaVu Sans'")
        )
        .Legend(legend => legend
            .Position(ChartLegendPosition.Top)
            .Labels(labels => labels.Font("12px 'DejaVu Sans'"));
        )
        .Series(series =>
        {
            series
                .Column(new int[] { 20, 40, 45, 30, 50 })
                .Stack(true)
                .Color("#cc6e38")
                .Name("on battery");
            series
                .Column(new int[] { 20, 30, 35, 35, 40 })
                .Stack(true)
                .Color("#ef955f")
                .Name("on gas");
            series
                .Line(new double[] { 30, 38, 40, 32, 42 })
                .Name("mpg")
                .Color("#ec5e0a")
                .Axis("mpg");
            series
                .Line(new double[] { 7.8, 6.2, 5.9, 7.4, 5.6 })
                .Name("l/100 km")
                .Color("#4e4141")
                .Axis("l100km");
        })
        .CategoryAxis(axis => axis
            .Categories("Mon", "Tue", "Wed", "Thu", "Fri")
            // Align the first two value axes to the left
            // and the last two to the right.
            //
            // Right alignment is done by specifying a
            // crossing value greater than or equal to
            // the number of categories.
            .AxisCrossingValue(0, 0, 10, 10)
        )
        .ValueAxis(axis => axis
            .Numeric()
                .Title("miles")
                .Min(0).Max(100)
        )
        .ValueAxis(axis => axis
            .Numeric("km")
                .Title("km")
                .Min(0).Max(161).MajorUnit(32)
        )
        .ValueAxis(axis => axis
            .Numeric("mpg")
                .Title("miles per gallon")
                .Color("#ec5e0a")
        )
        .ValueAxis(axis => axis
            .Numeric("l100km")
                .Title("liters per 100km")
                .Color("#4e4141")
        )
    %>
</div>
</asp:Content>
