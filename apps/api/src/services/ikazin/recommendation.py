from __future__ import annotations

from typing import Optional


def recommend_build(profile: Optional[str], experience: Optional[str], interest: Optional[str]) -> tuple[int, str]:
    profile = (profile or "").strip().lower()
    experience = (experience or "").strip().lower()
    interest = (interest or "").strip().lower()

    if profile == "student" and experience == "never" and interest == "fundamentals":
        return 1, "você está começando e quer fundamentos sólidos."
    if profile == "student" and experience == "never" and interest == "drives":
        return 7, "você quer entrar por drives sem perder a prática aplicada."
    if profile == "student" and experience == "basic":
        return 3, "você já viu o básico e precisa ganhar estrutura de projeto."
    if profile == "professional" and experience == "intermediate" and interest == "drives":
        return 14, "seu foco está em drives e casos mais próximos da operação real."
    if profile == "professional" and experience == "intermediate" and interest == "motion":
        return 15, "você já domina a base e quer avançar em motion control."
    if profile == "professional" and experience == "advanced" and interest == "motion":
        return 16, "você já está em nível alto e quer movimento mais avançado."
    if profile == "professional" and experience == "advanced" and interest == "robotics":
        return 19, "robótica pede integração avançada e cenários mais sofisticados."
    if profile == "manager":
        return 14, "é o build mais vendável para acelerar o time com aplicação real."
    return 1, "ele dá a melhor base para começar a trilha."
