package org.example.bibliotekaui.controllers;

import org.example.bibliotekaui.models.SessionData;
import org.example.bibliotekaui.models.SessionDataHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("")
    public String getHomePage(Model model){
//        SessionData sessionData = SessionDataHolder.getSessionData();
//        model.addAttribute("userId", sessionData.getExternalId());
//        model.addAttribute("email", sessionData.getEmail());
//        model.addAttribute("isEmailVerified", sessionData.getIsEmailVerified());
//        model.addAttribute("name", sessionData.getName());
//        model.addAttribute("pictureUrl", sessionData.getPictureUrl());
//        model.addAttribute("locale", sessionData.getLocale());
//        model.addAttribute("familyName", sessionData.getFamilyName());
//        model.addAttribute("giveName", sessionData.getGiveName());
        return  "login";
    }
    @GetMapping("/seat_reservation")
    public String getSeatsPage(Model model) {
        return "seat_reservation";
    }

}
