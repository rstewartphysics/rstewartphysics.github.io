"""Copy everything the 4b page links or shows into the site worktree (WEB-PLAN W8).

Photos are resized for the web (long side 900 px, JPEG q82). Practical sheets come from the
shipped OneDrive copies (read only), so the site serves exactly what was approved.
"""
import os
import shutil

from PIL import Image

B4B = os.path.expanduser("~/claude-work/n5-engineering/b4b")
ONEDRIVE = os.path.expanduser("~/Library/CloudStorage/OneDrive-GlowScotland/"
                              "BHS Physics Department - General/Engineering/National 5/4. Control")
SITE_DIR = "assets/engineering-science/national-5/04b-programmable-control"
WEB = "/" + SITE_DIR

PHOTOS = {  # file: (sector, alt, credit, licence url, source page)
    "l1_ticket_machine": ("Commercial", "A ticket machine at a railway station",
                          "Photo: Infrastorian, CC0, via Wikimedia Commons",
                          "https://creativecommons.org/publicdomain/zero/1.0/",
                          "https://commons.wikimedia.org/wiki/File:Plandome_LIRR_Station_Ticket_Vending_Machine,_July_3,_2026.jpg"),
    "l1_conveyor": ("Industrial", "Boxes moving along a packing-line conveyor",
                    "Photo: SimónK, CC BY-SA 4.0, via Wikimedia Commons",
                    "https://creativecommons.org/licenses/by-sa/4.0",
                    "https://commons.wikimedia.org/wiki/File:American_boxes.jpg"),
    "l1_bus_doors": ("Transport", "The automatic doors inside a bus",
                     "Photo: Leif Jørgensen, CC BY-SA 4.0, via Wikimedia Commons",
                     "https://creativecommons.org/licenses/by-sa/4.0",
                     "https://commons.wikimedia.org/wiki/File:Interior_of_autonomous_bus_in_Nordhavn_04.jpg"),
    "l1_smart_bulb": ("Home", "A smart light bulb",
                      "Photo: Danielrosehill, CC BY 4.0, via Wikimedia Commons",
                      "https://creativecommons.org/licenses/by/4.0",
                      "https://commons.wikimedia.org/wiki/File:Zigbee_E27_Bulb.jpg"),
}
BOARDS = ["l4_we1", "l4_we2", "l4_we3", "l4_debug2", "l4_crossing"]
SHEETS = [("N5EngSci_B4b_Practical1_Lamp_and_Traffic_Lights.pdf", "practical-1-lamp-and-traffic-lights.pdf",
           "Practical 1 — Lamp and Traffic Lights"),
          ("N5EngSci_B4b_Practical2_Darkness_Alarm_and_Find_and_Fix.pdf",
           "practical-2-darkness-alarm-and-find-and-fix.pdf", "Practical 2 — Darkness Alarm and Find and Fix"),
          ("N5EngSci_B4b_Practical3_Test_Amend_Retest.pdf", "practical-3-test-amend-retest.pdf",
           "Practical 3 — Test, Amend, Re-test"),
          ("N5EngSci_B4b_Practical4_Server_Room_Fan.pdf", "practical-4-server-room-fan.pdf",
           "Practical 4 — The Server-Room Fan", 3)]       # (source, site name, title[, pages: 2])
SIM_FILE = ("L4_crossing_FAULTY.json", "L4_crossing_FAULTY.json")


def copy_all(site):
    root = os.path.join(site, SITE_DIR)
    for sub in ("photos", "figures", "practicals", "sim"):
        os.makedirs(os.path.join(root, sub), exist_ok=True)
    for name in PHOTOS:
        out = os.path.join(root, "photos", name + ".jpg")
        with Image.open(os.path.join(B4B, "assets", "photos", "L1", name + ".jpg")) as im:
            im = im.convert("RGB")
            im.thumbnail((900, 900))
            im.save(out, quality=82, optimize=True)
    for b in BOARDS:
        shutil.copyfile(os.path.join(B4B, "assets", "boards", b + ".svg"),
                        os.path.join(root, "figures", b + ".svg"))
    with Image.open(os.path.join(B4B, "assets", "sim_l2.png")) as im:
        im.thumbnail((1100, 1100))
        im.save(os.path.join(root, "figures", "sim_l2.png"), optimize=True)
    for src, dst, *_ in SHEETS:
        shutil.copyfile(os.path.join(ONEDRIVE, src), os.path.join(root, "practicals", dst))
    shutil.copyfile(os.path.join(B4B, "sim_files", SIM_FILE[0]), os.path.join(root, "sim", SIM_FILE[1]))
