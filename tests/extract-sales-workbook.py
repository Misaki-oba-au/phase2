"""Convert the checked-in XLSX to the small SheetJS shape needed by JS tests."""

import json
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS = {"m": MAIN, "r": REL}


def main(path):
    with ZipFile(path) as archive:
        strings = []
        shared_strings = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        for item in shared_strings.findall("m:si", NS):
            strings.append("".join(node.text or "" for node in item.iter(f"{{{MAIN}}}t")))

        workbook_xml = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships_xml = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relationships = {item.attrib["Id"]: item.attrib["Target"] for item in relationships_xml}
        result = {"SheetNames": [], "Sheets": {}, "Workbook": {"WBProps": {"date1904": False}}}

        for sheet in workbook_xml.find("m:sheets", NS):
            name = sheet.attrib["name"]
            relationship_id = sheet.attrib[f"{{{REL}}}id"]
            target = relationships[relationship_id].lstrip("/")
            if not target.startswith("xl/"):
                target = f"xl/{target}"
            worksheet_xml = ET.fromstring(archive.read(target))
            worksheet = {}

            dimension = worksheet_xml.find("m:dimension", NS)
            worksheet["!ref"] = dimension.attrib["ref"] if dimension is not None else "A1"
            merges = worksheet_xml.findall(".//m:mergeCells/m:mergeCell", NS)
            worksheet["!merges"] = [item.attrib["ref"] for item in merges]

            for cell_xml in worksheet_xml.findall(".//m:c", NS):
                value_xml = cell_xml.find("m:v", NS)
                formula_xml = cell_xml.find("m:f", NS)
                if value_xml is None and formula_xml is None:
                    continue
                value = value_xml.text if value_xml is not None else None
                cell_type = cell_xml.attrib.get("t", "n")
                if cell_type == "s" and value is not None:
                    value = strings[int(value)]
                elif cell_type == "n" and value is not None:
                    value = float(value)
                    if value.is_integer():
                        value = int(value)
                cell = {"v": value, "t": cell_type}
                if formula_xml is not None:
                    cell["f"] = formula_xml.text or ""
                worksheet[cell_xml.attrib["r"]] = cell

            result["SheetNames"].append(name)
            result["Sheets"][name] = worksheet

        json.dump(result, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main(sys.argv[1])
