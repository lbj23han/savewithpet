import type { PetStatus } from "../types/app";

export type PetStatusViewModel = PetStatus & {
  percentLabel: string;
  isHealthy: boolean;
};

class PetProgressStatus {
  constructor(private readonly status: PetStatus) {}

  toViewModel(): PetStatusViewModel {
    return {
      ...this.status,
      percentLabel: `${this.status.value}%`,
      isHealthy: this.status.value >= 70,
    };
  }
}

export function createPetStatusViewModels(statuses: PetStatus[]): PetStatusViewModel[] {
  return statuses.map((status) => new PetProgressStatus(status).toViewModel());
}
